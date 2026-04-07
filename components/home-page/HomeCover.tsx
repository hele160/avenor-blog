import { Config } from "@/data/config";

export const HomeCover = () => {
  return (
    <div className="flex w-full flex-col items-center text-center">
      <div className="w-full">
        <div
          className="mt-5 mb-14 flex w-full justify-center rounded-xl"
          style={{
            aspectRatio: "4/1",
            background: `url(${Config.PageCovers.websiteCoverURL})`,
            backgroundSize: "cover",
          }}
        >
          <img
            alt={Config.Nickname}
            className="relative top-1/2 my-auto h-24 w-24 rounded-full shadow-2xl md:h-32 md:w-32"
            src={Config.AvatarURL}
          />
        </div>
      </div>
      <div className={"caption-font my-5 font-bold text-4xl"}>
        {Config.Nickname}
      </div>
      {Config.Sentence && (
        <div className="my-5 flex justify-center">
          <p className={"content-font text-center text-lg"}>
            {Config.Sentence}
          </p>
        </div>
      )}
    </div>
  );
};
