export class CredentialsDto {
  email!: string;
  password!: string;
  password_confirmation?: string;
}

export class CreateUserDto {
  credentials?: CredentialsDto;
  email?: string;
  password?: string;
}
