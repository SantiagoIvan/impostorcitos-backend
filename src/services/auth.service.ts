import { UserAlreadyExistsError } from "../domain/errors/UserAlreadyExists";
import { userManager } from "../domain/user/UserManager";

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

  if (!userExists) {
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
