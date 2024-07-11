import { IsDateString, Length } from 'class-validator';

export class CreateEventDto {
  @Length(5, 255, { message: 'Name is too short or too long' })
  name: string;
  @Length(5, 255, { message: 'Description is too short or too long' })
  description: string;
  @IsDateString()
  when: string;
  @Length(5, 255, {
    message: 'Address is too short or too long',
    groups: ['create'],
  })
  @Length(10, 20, {
    message: 'Updated address is too short or too long',
    groups: ['update'],
  })
  address: string;
}
