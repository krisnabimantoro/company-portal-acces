import { Test, TestingModule } from '@nestjs/testing';
import { AccesUserController } from './acces-user.controller';
import { AccesUserService } from './acces-user.service';

describe('AccesUserController', () => {
  let controller: AccesUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccesUserController],
      providers: [AccesUserService],
    }).compile();

    controller = module.get<AccesUserController>(AccesUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
