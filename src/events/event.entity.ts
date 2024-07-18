import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Attendee } from './attendee.entity';
import { User } from '../auth/user.entity';
import { Expose } from 'class-transformer';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  // only fields with @Expose() will be returned
  @Column()
  @Expose()
  name: string;
  @Column()
  description: string;
  @Column()
  when: Date;
  @Column()
  address: string;
  // one-to-many relationship
  @OneToMany(() => Attendee, (attendee) => attendee.event, {
    eager: true,
    cascade: true,
  })
  attendees: Attendee[];
  @ManyToOne(() => User, (user) => user.organized)
  @JoinColumn({ name: 'organizerId' })
  organizer: User;
  @Column({ nullable: true })
  organizerId: number;
  // virtual fields
  attendeeCount?: number;
  attendeeRejected?: number;
  attendeeMaybe?: number;
  attendeeAccepted?: number;
}
