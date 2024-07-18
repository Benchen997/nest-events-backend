import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateEventDto } from './input/create-event.dto';
import { UpdateEventDto } from './input/update-event.dto';
import { EventsService } from './events.service';
import { ListEvents } from './input/list.events';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../auth/user.entity';
import { AuthGuardJwt } from '../auth/auth-guard.jwt';

@Controller('/events')
@SerializeOptions({ strategy: 'excludeAll' })
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() filter: ListEvents) {
    return await this.eventsService.getEventsWithAttendeeCountFilteredPaginated(
      filter,
      {
        total: true,
        currentPage: filter.page,
        limit: 2,
      },
    );
  }
  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.eventsService.getEvent(id);
    if (!result) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }
    return result;
  }

  @Post()
  @UseGuards(AuthGuardJwt)
  async create(
    @Body(new ValidationPipe({ groups: ['create'] })) input: CreateEventDto,
    @CurrentUser() user: User,
  ) {
    return await this.eventsService.createEvent(input, user);
  }

  @Patch(':id')
  @UseGuards(AuthGuardJwt)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ groups: ['update'] })) input: UpdateEventDto,
    @CurrentUser() user: User,
  ) {
    return await this.eventsService.updateEvent(id, input, user);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(AuthGuardJwt)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return await this.eventsService.removeEvent(id, user);
  }
}
