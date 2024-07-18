import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './event.entity';
import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AttendeeAnswerEnum } from './attendee.entity';
import { ListEvents, WhenEventFilter } from './input/list.events';
import { paginate, PaginateOptions } from '../pagination/paginator';
import { CreateEventDto } from './input/create-event.dto';
import { User } from '../auth/user.entity';
import { UpdateEventDto } from './input/update-event.dto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}
  private getEventsBaseQuery() {
    /*
     * SELECT e.*
     * FROM events e
     * ORDER BY e.id DESC;
     *
     * */
    return this.eventsRepository
      .createQueryBuilder('e')
      .orderBy('e.id', 'DESC');
  }

  public async createEvent(input: CreateEventDto, user: User): Promise<Event> {
    return await this.eventsRepository.save({
      ...input,
      organizer: user,
      when: new Date(input.when),
    });
  }
  public async updateEvent(
    id: number,
    input: UpdateEventDto,
    user: User,
  ): Promise<Event> {
    const event = await this.eventsRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }
    if (event.organizerId !== user.id) {
      throw new ForbiddenException(null, `You can't update this event`);
    }
    return await this.eventsRepository.save({
      ...event,
      ...input,
      when: input.when ? new Date(input.when) : event.when,
    });
  }
  public async removeEvent(id: number, user: User): Promise<Event> {
    const event = await this.eventsRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }
    if (event.organizerId !== user.id) {
      throw new ForbiddenException(null, `You can't remove this event`);
    }
    return await this.eventsRepository.remove(event);
  }
  public getEventsWithAttendeeCountQuery() {
    /*
    * SELECT e.*,
       (SELECT COUNT(*)
        FROM attendees a
        WHERE a.eventId = e.id) AS attendeeCount,
       (SELECT COUNT(*)
        FROM attendees a
        WHERE a.eventId = e.id
          AND a.answer = 'Accepted') AS attendeeAccepted
      FROM events e;
    * */
    return this.getEventsBaseQuery()
      .loadRelationCountAndMap('e.attendeeCount', 'e.attendees')
      .loadRelationCountAndMap(
        'e.attendeeAccepted',
        'e.attendees',
        'attendee',
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Accepted,
          }),
      )
      .loadRelationCountAndMap(
        'e.attendeeMaybe',
        'e.attendees',
        'attendee',
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Maybe,
          }),
      )
      .loadRelationCountAndMap(
        'e.attendeeRejected',
        'e.attendees',
        'attendee',
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Rejected,
          }),
      );
  }
  public async getEvent(id: number): Promise<Event | undefined> {
    const event = await this.getEventsWithAttendeeCountQuery()
      .andWhere('e.id = :id', { id })
      .getOne();
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }
    return event;
  }
  public async getEventsWithAttendeeCountFilteredPaginated(
    filter: ListEvents,
    paginateOptions: PaginateOptions,
  ) {
    return await paginate(
      await this.getEventsWithAttendeeCountFiltered(filter),
      paginateOptions,
    );
  }
  private async getEventsWithAttendeeCountFiltered(filter?: ListEvents) {
    let query = this.getEventsWithAttendeeCountQuery();

    if (!filter) {
      return query;
    }

    if (filter.when) {
      if (filter.when == WhenEventFilter.Today) {
        query = query.andWhere(
          `e.when >= CURDATE() AND e.when <= CURDATE() + INTERVAL 1 DAY`,
        );
      }

      if (filter.when == WhenEventFilter.Tomorrow) {
        query = query.andWhere(
          `e.when >= CURDATE() + INTERVAL 1 DAY AND e.when <= CURDATE() + INTERVAL 2 DAY`,
        );
      }

      if (filter.when == WhenEventFilter.ThisWeek) {
        query = query.andWhere('YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1)');
      }

      if (filter.when == WhenEventFilter.NextWeek) {
        query = query.andWhere(
          'YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1) + 1',
        );
      }
    }

    return query;
  }
}
