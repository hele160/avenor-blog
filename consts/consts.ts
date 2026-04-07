import path from "path";
import { Config } from "@/data/config";
import { getCurrentTime } from "@/lib/date";
import process from "process";

export const LatestPostCountInHomePage = 10;
export const PostCountPerPagination = 7;
export const UserDataDirectory = path.join(process.cwd(), "./data");
export const PostFilesDirectory = path.join(UserDataDirectory, "/posts");

export const RSSFeedURL = `https://${Config.SiteDomain}/rss.xml`;
export const WebsiteURL = `https://${Config.SiteDomain}/`;

const year = getCurrentTime().year;
export const CopyrightAnnouncement = `COPYRIGHT © ${Config.YearStart === year ? year : `${Config.YearStart}-${year}`} ${Config.AuthorName} ALL RIGHTS RESERVED`;
