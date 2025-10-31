import { Test, TestingModule } from '@nestjs/testing';
import { AccesUserService } from './acces-user.service';

describe('AccesUserService', () => {
  let service: AccesUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccesUserService],
    }).compile();

    service = module.get<AccesUserService>(AccesUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
