import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bull';
import { Repository } from 'typeorm';
import { Queue } from 'bull';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BookingService } from './booking.service';
import { Booking, BookingStatus } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { WebSocketService } from '@app/shared';

describe('BookingService', () => {
  let service: BookingService;
  let repository: Repository<Booking>;
  let queue: Queue;
  let webSocketService: WebSocketService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    remove: jest.fn(),
  };

  const mockQueue = {
    add: jest.fn(),
  };

  const mockWebSocketService = {
    notifyBookingCreated: jest.fn(),
    notifyBookingUpdated: jest.fn(),
    notifyBookingDeleted: jest.fn(),
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockBooking = {
    id: 'booking-123',
    title: 'Test Meeting',
    description: 'Test Description',
    startTime: new Date('2024-12-31T10:00:00Z'),
    endTime: new Date('2024-12-31T11:00:00Z'),
    status: BookingStatus.SCHEDULED,
    location: 'Conference Room A',
    notes: 'Test notes',
    reminderSent: false,
    userId: mockUser.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockRepository,
        },
        {
          provide: getQueueToken('booking-jobs'),
          useValue: mockQueue,
        },
        {
          provide: WebSocketService,
          useValue: mockWebSocketService,
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    repository = module.get<Repository<Booking>>(getRepositoryToken(Booking));
    queue = module.get<Queue>(getQueueToken('booking-jobs'));
    webSocketService = module.get<WebSocketService>(WebSocketService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createBookingDto: CreateBookingDto = {
      title: 'Test Meeting',
      description: 'Test Description',
      startTime: '2024-12-31T10:00:00Z',
      endTime: '2024-12-31T11:00:00Z',
      location: 'Conference Room A',
      notes: 'Test notes',
    };

    it('should create a booking successfully', async () => {
      mockRepository.findOne.mockResolvedValue(null); // No overlapping booking
      mockRepository.create.mockReturnValue(mockBooking);
      mockRepository.save.mockResolvedValue(mockBooking);
      mockQueue.add.mockResolvedValue({});

      const result = await service.create(createBookingDto, mockUser.id);

      expect(result).toEqual(mockBooking);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createBookingDto,
        startTime: new Date(createBookingDto.startTime),
        endTime: new Date(createBookingDto.endTime),
        userId: mockUser.id,
        status: BookingStatus.SCHEDULED,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockBooking);
      expect(mockWebSocketService.notifyBookingCreated).toHaveBeenCalled();
    });

    it('should throw BadRequestException for past start time', async () => {
      const pastDto = {
        ...createBookingDto,
        startTime: '2020-01-01T10:00:00Z',
      };

      await expect(service.create(pastDto, mockUser.id)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for end time before start time', async () => {
      const invalidDto = {
        ...createBookingDto,
        startTime: '2024-12-31T11:00:00Z',
        endTime: '2024-12-31T10:00:00Z',
      };

      await expect(service.create(invalidDto, mockUser.id)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for overlapping booking', async () => {
      mockRepository.findOne.mockResolvedValue(mockBooking); // Overlapping booking exists

      await expect(service.create(createBookingDto, mockUser.id)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated bookings', async () => {
      const mockBookings = [mockBooking];
      mockRepository.findAndCount.mockResolvedValue([mockBookings, 1]);

      const result = await service.findAll(mockUser.id, 1, 10);

      expect(result).toEqual({
        data: mockBookings,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a booking', async () => {
      mockRepository.findOne.mockResolvedValue(mockBooking);

      const result = await service.findOne(mockBooking.id, mockUser.id);

      expect(result).toEqual(mockBooking);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockBooking.id, userId: mockUser.id },
      });
    });

    it('should throw NotFoundException when booking not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('non-existent-id', mockUser.id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateBookingDto: UpdateBookingDto = {
      title: 'Updated Meeting',
      description: 'Updated Description',
    };

    it('should update a booking successfully', async () => {
      const updatedBooking = { ...mockBooking, ...updateBookingDto };
      mockRepository.findOne.mockResolvedValue(mockBooking);
      mockRepository.save.mockResolvedValue(updatedBooking);

      const result = await service.update(
        mockBooking.id,
        updateBookingDto,
        mockUser.id,
      );

      expect(result).toEqual(updatedBooking);
      expect(mockWebSocketService.notifyBookingUpdated).toHaveBeenCalled();
    });

    it('should throw NotFoundException when booking not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', updateBookingDto, mockUser.id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a booking successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockBooking);
      mockRepository.remove.mockResolvedValue(mockBooking);

      await service.remove(mockBooking.id, mockUser.id);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockBooking);
      expect(mockWebSocketService.notifyBookingDeleted).toHaveBeenCalledWith(
        mockUser.id,
        mockBooking.id,
      );
    });

    it('should throw NotFoundException when booking not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.remove('non-existent-id', mockUser.id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findUpcoming', () => {
    it('should return upcoming bookings', async () => {
      const upcomingBookings = [mockBooking];
      mockRepository.find.mockResolvedValue(upcomingBookings);

      const result = await service.findUpcoming(mockUser.id, 10);

      expect(result).toEqual(upcomingBookings);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          userId: mockUser.id,
          startTime: expect.any(Object), // MoreThan(now)
          status: BookingStatus.SCHEDULED,
        },
        order: { startTime: 'ASC' },
        take: 10,
      });
    });
  });

  describe('findPast', () => {
    it('should return past bookings', async () => {
      const pastBookings = [mockBooking];
      mockRepository.find.mockResolvedValue(pastBookings);

      const result = await service.findPast(mockUser.id, 10);

      expect(result).toEqual(pastBookings);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          userId: mockUser.id,
          endTime: expect.any(Object), // LessThan(now)
        },
        order: { endTime: 'DESC' },
        take: 10,
      });
    });
  });

  describe('updateStatus', () => {
    it('should update booking status', async () => {
      const updatedBooking = { ...mockBooking, status: BookingStatus.COMPLETED };
      mockRepository.findOne.mockResolvedValue(mockBooking);
      mockRepository.save.mockResolvedValue(updatedBooking);

      const result = await service.updateStatus(
        mockBooking.id,
        BookingStatus.COMPLETED,
        mockUser.id,
      );

      expect(result).toEqual(updatedBooking);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });
});
