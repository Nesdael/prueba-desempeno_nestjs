import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, PrimaryColumn } from 'typeorm';
import { Role } from '../../../common/enum/role.enum.js';

export class User {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updateAt: Date;
}
