import passport from "passport";
import User from "../models/User";
import routes from "../routes";

export const getEditProfile = (req, res) => {
    res.render("editProfile");
}

export const postEditProfile = async (req, res) => {
    const { user: { id }, body: { name }, file: { path } } = req;

    try {
        await User.findByIdAndUpdate(id, { name, avatarUrl: path });
        res.redirect(routes.userDetail(id));
    } catch (error) {
        console.log(error);
        res.redirect(`/users${routes.editProfile}`);
    }
}

export const getJoin = (req, res) => {
    res.render("join");
}

export const postJoin = async (req, res, next) => {
    const {
        body: {
            email, name, password, password2
        }
    } = req;
    if (password != password2) {
        res.status(400);
        res.redirect(`/users${routes.join}`);
    } else {
        try {
            const user = await User({
                name, email
            }
            );
            await User.register(user, password);
            next();
        } catch (error) {
            console.log(error);
            res.redirect(routes.home);
        }
    }
}

export const getLogin = (req, res) => {
    res.render("login");
}

export const postLogin = passport.authenticate("local", {
    successRedirect: routes.home,
    failureRedirect: `/users${routes.login}`
});

export const profile = (req, res) => {
    res.render("profile");
}

export const userDetail = (req, res) => {
    res.render("userDetail");
}

export const getChangePassword = (req, res) => {
    res.render("changePassword");
}

export const postChangePassword = async (req, res) => {
    const { body: { currentPassword, newPassword, newPassword2 }, user: { id } } = req;
    if (newPassword != newPassword2) {
        console.log("비밀번호 불일치.");

        res.redirect(`users${routes.changePassword}`);
    } else {
        try {
            const user = await User.findById(id);
            await user.changePassword(currentPassword, newPassword);
            res.redirect(routes.home);

        } catch (error) {
            console.log(error);
            res.redirect(routes.home);
        }
    }

}

export const googleCallback = async (accessToken, refreshToken, profile, cb) => {
    const { _json: { name, picture, email }, id } = profile;
    try {
        const user = await User.findOne({ email })
        if (user) {
            return cb(null, user);
        }
        else {
            const newUser = await User.create({
                email, name, avatarUrl: picture, googleId: id
            });
            return cb(null, newUser);
        }
    } catch (error) {
        return cb(error);
    }
}

export const naverCallback = async (accessToken, refreshToken, profile, cb) => {
    console.log(profile);
    const { _json: { nickname, profile_image, email }, id } = profile;
    try {
        const user = await User.findOne({ email })
        if (user) {
            return cb(null, user);
        }
        else {
            const newUser = await User.create({
                email, name: nickname, avatarUrl: profile_image, naverId: id
            });
            return cb(null, newUser);
        }
    } catch (error) {

        return cb(error);
    }
}

export const googleLogin = passport.authenticate('google', { scope: ['profile', 'email'] });

export const postGoogleLogin = passport.authenticate('google', { failureRedirect: `users${routes.login}` });

export const naverLogin = passport.authenticate('naver', null);

export const postNaverLogin = passport.authenticate('naver', { failureRedirect: `users${routes.login}` });

export const logout = (req, res) => {
    req.logout();
    res.redirect(routes.home);
}