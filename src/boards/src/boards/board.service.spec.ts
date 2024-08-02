import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioBoardService } from './board.service';

describe('BoardService', () => {
  let service: PortfolioBoardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PortfolioBoardService],
    }).compile();

    service = module.get<PortfolioBoardService>(PortfolioBoardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
