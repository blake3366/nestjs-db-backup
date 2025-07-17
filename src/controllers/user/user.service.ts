import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prismaService:PrismaService) {}
  create(createUserDto: CreateUserDto) {
    // return 'This action adds a new user';
    return this.prismaService.user.create({
      data: createUserDto,
    });
  }

  findAll() {
    return this.prismaService.user.findMany({
      where: {
        deletedAt: null, 
      },
      include: {
        posts: {
          select: {
            id: true,
            title: true,
            content: true,
          },
        },
        profile: {
          select: {
            bio: true,
          },
        }
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  findOne(id: number) {
    // return `This action returns a #${id} user`;
    return this.prismaService.user.findUnique({
      where: { id },
      include: {
        posts: {
          select: {
            id: true,
            title: true,
            content: true,
          },
        },
        profile: {
          select: {
            bio: true,
          },
        }
      },
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    // return `This action updates a #${id} user`;
    return this.prismaService.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  remove(id: number) {
    // return this.prismaService.$transaction([
    //   this.prismaService.post.deleteMany({ where: { authorId: id } }),
    //   this.prismaService.profile.deleteMany({ where: { userId: id } }),
    //   this.prismaService.user.delete({ where: { id } }),
    // ]);
    return this.prismaService.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
