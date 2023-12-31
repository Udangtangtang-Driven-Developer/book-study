import { Maybe } from "../../libs";
import { Profile, User } from "../models/user.model";

export class MockUserApi {
  #MOCK_USERS: User[] = [
    {
      id: 1,
      name: "John",
      age: 30,
      address: "Seoul",
      email: "john@example.net",
    },
    {
      id: 2,
      name: "Jane",
      age: 25,
      address: "Busan",
      email: "Jane@example.net",
    },
    {
      id: 3,
      name: "Smith",
      age: 28,
      address: "Gwangju",
      email: "Smith@example.net",
    },
  ];

  #MOCK_PROFILES: Profile[] = [
    {
      id: 1,
      userId: 1,
      phone: "01022223333",
      profileImage: "https://picsum.photos/200",
      website: "https://example.com",
    },
    {
      id: 2,
      userId: 2,
      phone: "01011112222",
      profileImage: "https://picsum.photos/201",
      website: "https://example.com",
    },
  ];

  /**
   * @description 모든 유저 목록을 반환한다.
   */
  public findAll(): Maybe<User[]> {
    return Maybe.of(this.#MOCK_USERS);
  }

  /**
   * @description 유저 이름으로 유저를 찾는다.
   */
  public findByName(name: string): Maybe<User> {
    const user = this.#MOCK_USERS.find((user) => user.name === name);

    return Maybe.of(user);
  }

  /**
   * @description 유저 아이디로 프로필을 찾는다.
   */
  public findProfileByUserId(userId: number): Maybe<Profile> {
    const profile = this.#MOCK_PROFILES.find(
      (profile) => profile.userId === userId
    );

    return Maybe.of(profile);
  }
}
