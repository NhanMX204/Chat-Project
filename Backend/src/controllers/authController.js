import bcrypt from 'bcrypt';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Sesion } from '../models/Sesion.js';

const ACCESS_TOKEN_TTL='30m'; //30 phut
const REFRESH_TOKEN_TTL=14*24*60*60*1000; //14 ngay

export const signUp = async (req, res) => {
    try {
        //lay du lieu tu body
        const {username, password, email,firstName,lastName} = req.body;
        if (!username || !password || !email || !firstName || !lastName) {
            return res.status(400).json({ message: "khong the thieu thong tin" });
        }

        //Kiem tra username da ton tai chua
        const duplicate = await User.findOne({username});
        if (duplicate) {
            return res.status(409).json({ message: "username da ton tai" });
        }

        //ma hoa mat khau
        const hashedPassword = await bcrypt.hash(password, 10);


        //tao nguoi dung moi va luu vao db
        await User.create({
            username,
            hashPassword:hashedPassword,
            email,
            displayName: `${firstName} ${lastName}`
        });

        //return ket qua
        return res.sendStatus(204);
    } catch (error) {
        console.error("Error during sign up:", error);
        return res.status(500).json({ message: "loi server" });
    }
}

export const signIn = async (req, res) => {
    try {
        //lay du lieu tu body
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "khong the thieu thong tin" });
        }
        //so sanh thong tin dang nhap
        const user = await User.findOne({ username });
        if (!user){
            return res.status(401).json({ message: "username hoac password khong dung" });
        }

        const passwordCorrect = await bcrypt.compare(password, user.hashPassword);
        if (!passwordCorrect){
            return res.status(401).json({ message: "username hoac password khong dung" });
        }

        // tao access token
        const accessToken = jwt.sign({userId: user._id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: ACCESS_TOKEN_TTL});

        // tao refresh token
        const refreshToken = crypto.randomBytes(64).toString('hex');

        // console.log("Refresh Token:", refreshToken);

        // tao session moi de luu refresh token
        await Sesion.create({
            userId: user._id,
            refreshToken: refreshToken,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL)
        });

        // tra fresh token ve cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: REFRESH_TOKEN_TTL
        });

        // tra access token ve res
        return res.status(200).json({ message: "dang nhap thanh cong", accessToken });


    } catch (error) {
        console.error("Error during sign in:", error);
        return res.status(500).json({ message: "loi server" });
    }
}

export const signOut = async (req, res) => {
    try {
        // lay refresh token tu cookie
        const refreshToken = req.cookies?.refreshToken;

        if (refreshToken){
            // xoa refresh token trong db
            await Sesion.deleteOne({ refreshToken });

            // xoa cookie refresh token
            res.clearCookie('refreshToken');
        }

        res.sendStatus(204);

    } catch (error) {
        console.error("Error during sign out:", error);
        return res.status(500).json({ message: "loi server" });
    }
}