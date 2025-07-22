// import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({example: 'Blake'})
//   @IsString()
  name: string;

  @ApiProperty({example: '123@email.com'})
//   @IsEmail()
  email: string;

  @ApiProperty({example:  '123'})
//   @IsString()
  password: string;
}