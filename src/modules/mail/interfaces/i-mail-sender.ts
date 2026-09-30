export interface IMailSender {
  user: string;
  password: string;
  from: string;
  // Display name recipients see instead of the raw sending address
  name: string;
}
