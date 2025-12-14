import { Request, Response } from "express";

import { ILoginUpDTO, ISignUpDTO } from "./auth.dto";

class AuthentcationService {
  constructor() {}

  signup = async (req: Request, res: Response) => {
    const { username, email, password, confirmPassword }: ISignUpDTO = req.body;
    console.log({ username, email, password, confirmPassword });

    res.status(201).json({ message: "signUp is sucssefuly" });
  };
  login = async (req: Request, res: Response) => {
    const { email, password }: ILoginUpDTO = req.body;
    console.log({ email, password });

    res.status(201).json({ message: "login is sucssefuly" });
  };
}

export default new AuthentcationService();
