import Video from "../models/Video";
import User from "../models/User";
import routes from "../routes";

export const videoHome = async (req, res) => {
  try {
    const videos = await Video.find({});
    res.render("home", { videos });
  }
  catch (error) {
    console.log(error);
    res.render("home", { videos: [] });
  }
}


export const getUploadVideo = (req, res) => {
  res.render("upload");
}

export const postUploadVideo = async (req, res) => {
  const { user: { id }, body: { videoName, description }, file: { path } } = req;
  console.log(req.file);
  try {
    const newVideo = await Video.create({
      title: videoName,
      description: description,
      fileUrl: path,
      creator: id
    });

    const user = await User.findById(id);
    user.videos.push(newVideo._id);
    user.save();

    res.redirect(routes.videoDetail(newVideo._id));
  }
  catch (error) {
    res.redirect(`/videos${routes.upload}`);
  }
}

export const search = async (req, res) => {
  const { query: { search } } = req;
  try {
    const videos = await Video.find({ title: { $regex: search, $options: "i" } });
    res.render("search", { search, videos });
  } catch (error) {
    console.log(error);
    res.render("search", { search, videos: [] });
  }
}

export const videoDetail = async (req, res) => {
  const { params: { id } } = req;
  try {
    const video = await Video.findById(id).populate('creator').populate('comments');
    console.log(video);
    res.render("videoDetail", { video, pageTitle: video.title });

  } catch (error) {
    console.log(error);
    res.redirect(routes.home);
  }
}

export const editVideo = (req, res) => {
  res.render("editVideo");
}

export const deleteVideo = async (req, res) => {
  const {
    params: { id }
  } = req;
  try {

    await Video.findByIdAndRemove(id);

    const user = await User.findById(req.user.id);
    user.videos.pull(id);
    user.save();

    res.redirect(routes.home);

  } catch (error) {
    console.log(error);
    res.redirect(routes.editVideo(id));
  }

}


