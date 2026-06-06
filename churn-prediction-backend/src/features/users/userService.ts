import { userRepository } from './userRepository.js';

class UserService {
   async listAgents() {
      return await userRepository.findActiveAgents();
   }
}

export const userService = new UserService();
