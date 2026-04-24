import axios from "axios";
import type { AuthResponse } from "../models/auth.response";
import type { CreateUserDto } from "../models/create-user.dto";
import type { LoginUserDto } from "../models/login-user.dto";
import type { User } from "../models/user.model";
import { getCurrentUser } from "./user.service";

const authClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export async function loginUser(payload: LoginUserDto) {
  const body = new URLSearchParams(payload);
  const { data } = await authClient.post<AuthResponse>("/auth/login", body, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
  });

  if (!data?.access_token) {
    throw new Error("Login OK pero no se recibió token");
  }

  const user = await getCurrentUser(data.access_token);

  return {
    token: data.access_token,
    user,
  };
}

export async function registerUser(payload: CreateUserDto) {
  const body = new URLSearchParams(payload);
  const { data } = await authClient.post<AuthResponse>("/auth/register", body, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
  });

  if (!data?.access_token) {
    throw new Error("Registro OK pero no se recibió token");
  }

  const user = await getCurrentUser(data.access_token);

  return {
    token: data.access_token,
    user,
  };
}
