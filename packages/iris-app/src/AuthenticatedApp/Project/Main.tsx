import React, { useCallback } from "react";

import { uploadImages } from "@iris/store/dist/project";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { useDropzone } from "react-dropzone";
import { useDispatch } from "react-redux";

import { videoToJPEGs, imageToJPEG } from "./image-utils";
import Localization from "./Localization";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dropzone: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      outline: "none",
    },
    dropActive: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      padding: 12,
      color: "var(--detailText)",
      background: `radial-gradient(
        ellipse at center,
        var(--dropzoneGrad1) 0%,
        var(--dropzoneGrad2) 65%,
        var(--dropzoneGrad2) 100%
      )`,
      transition: "visibility 0.2s, opacity 0.2s;",
      visibility: "visible",
      opacity: 1,
    },
    drop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      padding: 12,
      color: "var(--detailText)",
      visibility: "hidden",
      background: `radial-gradient(
        ellipse at center,
        var(--dropzoneGrad1) 0%,
        var(--dropzoneGrad2) 65%,
        var(--dropzoneGrad2) 100%
      )`,
      opacity: 0,
      transition: "visibility 0.2s, opacity 0.2s;",
    },
    dropOutline: {
      border: " 6px var(--textInputUnderline) dashed",
      backgroundColor: "rgba(141, 155, 165, 0.15)",
      borderRadius: 5,
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    dropText: {
      fontSize: 24,
      fontWeight: 600,
    },
  })
);

async function createJPEGs(files: File[]) {
  const images = files
    .filter(({ type }) => type.startsWith("image/"))
    .map(async (file) => {
      return await imageToJPEG(file, {
        maxWidth: window.MAX_IMAGE_WIDTH,
        maxHeight: window.MAX_IMAGE_HEIGHT,
        scaleMode: window.IMAGE_SCALE_MODE,
      });
    });

  const videos = files
    .filter(({ type }) => type.startsWith("video/"))
    .map(async (file) => {
      return await videoToJPEGs(file, {
        fps: window.FPS,
        maxWidth: window.MAX_IMAGE_WIDTH,
        maxHeight: window.MAX_IMAGE_HEIGHT,
        scaleMode: window.IMAGE_SCALE_MODE,
      });
    });

  const nestedJPEGArray = await Promise.all(videos);
  const jpegArray = await Promise.all(images);

  return [...jpegArray, ...nestedJPEGArray.flat()];
}

function Main() {
  const classes = useStyles();

  const dispatch = useDispatch();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const jpegs = await createJPEGs(acceptedFiles);
      // TODO: this is garbage...
      // console.log(jpegs);
      // dispatch(uploadImages(jpegs.map((j) => j.name)));
      let promises = [];
      for (const jpeg of jpegs) {
        const formData = new FormData();
        formData.append(jpeg.name, jpeg.blob);
        promises.push(
          fetch(`/api/projects/x/images`, {
            method: "POST",
            body: formData,
          })
        );
      }
      Promise.all(promises).then(() => {
        dispatch(uploadImages(jpegs.map((j) => j.name)));
      });
    },
    [dispatch]
  );

  const { getRootProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    accept: "image/*,video/*",
  });

  return (
    <div className={classes.dropzone} {...getRootProps()}>
      <div className={isDragActive ? classes.dropActive : classes.drop}>
        <div className={classes.dropOutline}>
          <div className={classes.dropText}>Drop to upload your images</div>
        </div>
      </div>
      <Localization />
    </div>
  );
}

export default Main;
