export interface JoinGameRequest {
  lobbyId: string;
  avatar: string;
  username: string;
}

export interface LeaveGameRequest {
  lobbyId: string;
  avatar: string;
  username: string;
}

export interface ChangeAnswerFieldRequest {
  lobbyId: string;
  guess: string;
  username: string;
}

export interface SendAnswerRequest {
  lobbyId: string;
  guess: string;
  username: string;
}
