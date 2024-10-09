import jwt from 'jsonwebtoken'

export const GenerateToken = (pin: number) => {
    const secret = process.env.SECRET as string;

    return jwt.sign({pin}, secret, {
        expiresIn: '30m'
    })
}