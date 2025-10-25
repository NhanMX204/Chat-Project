import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
  try {
    // lay token tu header
    const authHeader = req.headers["authorization"];
    // console.log("Authorization Header:", authHeader);
    const token = authHeader && authHeader.split(" ")[1];
    // console.log("Extracted Token:", token);
    if (!token) {
      return res
        .status(401)
        .json({ message: "Khong co token, truy cap bi tu choi" });
    }

    // xac nhan token hop le
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Token khong hop le" });
      }
      // console.log("Decoded Token:", decoded);
      // tim user tu token
      const user = await User.findById(decoded.userId).select("-hashPassword"); // khong tra ve password
      console.log("Authenticated User:", user);
      if (!user) {
        return res.status(404).json({ message: "User khong ton tai" });
      }

      // tra user ve trong req
      req.user = user;
      next();
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};
