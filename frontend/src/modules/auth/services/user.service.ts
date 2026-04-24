import apiClient from "@/api/apiClient";
import type { User } from "../models/user.model";
import type { UpdateUserDto } from "../models/update-user.dto";

type ApiUserResponse = {
  userId: string;
  name: string;
  email: string;
};

function mapUserResponse(data: ApiUserResponse): User {
  return {
    id: data.userId,
    email: data.email,
    name: data.name,
  };
}

export async function getCurrentUser(token?: string) {
  const { data } = await apiClient.get<ApiUserResponse>("/users/me", {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  return mapUserResponse(data);
}

export async function updateCurrentUser(payload: UpdateUserDto) {
  const { data } = await apiClient.patch<ApiUserResponse>("/users/me", payload);
  return mapUserResponse(data);
}

export async function resetCurrentUserData() {
  await apiClient.delete("/users/me/reset");
}

export async function seedCurrentUserData() {
  await apiClient.post("/users/me/seed");
}
