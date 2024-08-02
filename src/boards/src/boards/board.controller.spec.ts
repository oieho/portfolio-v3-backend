import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioBoardController } from './board.controller';

describe('BoardController', () => {
  let controller: PortfolioBoardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortfolioBoardController],
    }).compile();

    controller = module.get<PortfolioBoardController>(PortfolioBoardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
