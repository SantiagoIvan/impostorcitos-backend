import { UserNotFoundError } from "../domain";
import { UserAlreadyExistsError } from "../domain/errors/UserAlreadyExists";
import { userManager } from "../domain/user/UserManager";
import { userService } from "./user.service";

interface LoginResponse {
  user: {
    id: string;
    username: string;
  };
}

export const loginUser = async (
  username: string
): Promise<LoginResponse> => {
  const userExists = userManager.userExists(username);

  if (userExists) {
    throw new UserAlreadyExistsError(username);
  }
  const user = userManager.addUser(username)
  
  return {
    user: {
      id: user.id,
      username: user.username
    }
  };
};

export const logoutUser = async (
  username: string
): Promise<LoginResponse> => {
  const user = userManager.getUserByUsername(username)

  if (!user) {
    throw new UserNotFoundError(username);
  }
  userService.handleDisconnect(user)
  
  return {
    user: {
      id: user.id,
      username: user.username
    }
  };
};
