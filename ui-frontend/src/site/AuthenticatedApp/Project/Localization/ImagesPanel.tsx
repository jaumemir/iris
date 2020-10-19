import React, { useEffect, useRef, useCallback } from "react";

import HorizontalListController from "src/common/HorizontalList/HorizontalListController";
import ImageTileV4 from "src/common/ImageTile/ImageTileV4";

import styles from "./ImagesPanel.module.css";

const blockSwipeBack = (element: any) => (e: any) => {
  e.stopPropagation();
  if (!element.contains(e.target)) {
    return;
  }

  e.preventDefault();
  const max = element.scrollWidth - element.offsetWidth;
  const scrollPosition =
    Math.abs(e.deltaX) > Math.abs(e.deltaY)
      ? element.scrollLeft + e.deltaX
      : element.scrollLeft + e.deltaY;
  element.scrollLeft = Math.max(0, Math.min(max, scrollPosition));
};

const useBlockSwipeBack = (ref: any) => {
  useEffect(() => {
    const current = ref.current;
    document.addEventListener("mousewheel", blockSwipeBack(current), {
      passive: false,
    });
    return () => {
      document.removeEventListener("mousewheel", blockSwipeBack(current));
    };
  }, [ref]);
};

function ImagesPanel() {
  const imageFilter: any = true;
  const allImageCount = 0;
  const images: string[] = ["", ""];
  const labels: { [key: string]: string } = {
    dog: (10).toLocaleString(),
    cat: (20).toLocaleString(),
  };
  const cells = [
    <ImageTileV4 url="https://www.aspca.org/sites/default/files/blog_make-dogs-day_101619_main.jpg" />,
    <ImageTileV4 url="https://www.sciencemag.org/sites/default/files/styles/article_main_image_-_1280w__no_aspect_/public/dogs_1280p_0.jpg" />,
  ];
  const range: number[] = []; // [0, 3, 4];
  const selectedIndex = 1;
  const handleSelectionChanged = useCallback(
    (label) => () => {
      // handleImageFilterChange({ target: { value: label } });
    },
    []
  );

  //////////

  const scrollElementRef = useRef(null);
  useBlockSwipeBack(scrollElementRef);

  const handleDelete = useCallback(
    (label) => (e: any) => {
      e.stopPropagation();
      // const deleteTheLabel = window.confirm(
      //   `Are you sure you want to delete the label "${label}"? This action will delete any bounding boxes associated with this label.`
      // );
      // if (deleteTheLabel) {
      //   syncAction(deleteLabel, [label]);
      // }
    },
    []
  );

  const handleClickLabel = useCallback(
    (label) => () => {
      // handleImageFilterChange({ target: { value: label } });
    },
    []
  );

  const actualLabelMode =
    imageFilter !== true && imageFilter !== false && imageFilter !== undefined;

  return (
    <div className={styles.wrapper}>
      <div className={styles.labelFilterWrapper}>
        {actualLabelMode ? (
          <>
            <div className={styles.labelCount}>
              {allImageCount.toLocaleString()}
            </div>
            <div
              onClick={handleClickLabel("all")}
              className={styles.filterNotSelected}
            >
              All Images
            </div>
          </>
        ) : (
          <>
            <div className={styles.labelCount}>
              {images.length.toLocaleString()}
            </div>
            <select
              className={styles.filter}
              // onChange={handleImageFilterChange}
            >
              <option value="all">All Images</option>
              <option value="labeled">Labeled</option>
              <option value="unlabeled">Unlabeled</option>
            </select>
          </>
        )}

        <div ref={scrollElementRef} className={styles.labelList}>
          {Object.keys(labels).map((label) => (
            <div
              key={label}
              className={
                imageFilter === label
                  ? styles.selectedLabelItem
                  : styles.labelItem
              }
              onClick={handleClickLabel(label)}
            >
              <div>{label}</div>
              <div className={styles.labelItemCount}>{labels[label]}</div>
              <div onClick={handleDelete(label)} className={styles.deleteIcon}>
                <svg height="12px" width="12px" viewBox="2 2 36 36">
                  <g>
                    <path d="m31.6 10.7l-9.3 9.3 9.3 9.3-2.3 2.3-9.3-9.3-9.3 9.3-2.3-2.3 9.3-9.3-9.3-9.3 2.3-2.3 9.3 9.3 9.3-9.3z" />
                  </g>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.imageList}>
        <HorizontalListController
          items={images}
          cells={cells}
          range={range}
          selection={selectedIndex}
          onSelectionChanged={handleSelectionChanged}
        />
      </div>
    </div>
  );
}

export default ImagesPanel;