import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthDto,UserRole} from './dto/auth.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService:AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue:mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should call authService.register with correct data', async () => {
      const dto: AuthDto = {
        email: 'test@example.com',
        password: 'securePass123',
        role: UserRole.ADMIN,
      };
      const result = { id: 1, email: dto.email, role: dto.role };
      mockAuthService.register.mockResolvedValue(result);

      const response = await authController.register(dto);
      expect(response).toEqual(result);
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should call authService.login with correct data', async () => {
      const dto: AuthDto = {
        email: 'test@example.com',
        password: 'securePass123',
        role: UserRole.EDITOR,
      };
      const result = { accessToken: 'jwt-token' };
      mockAuthService.login.mockResolvedValue(result);

      const response = await authController.login(dto);
      expect(response).toEqual(result);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });
  });
});
