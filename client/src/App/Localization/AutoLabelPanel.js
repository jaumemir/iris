import React, { useCallback } from 'react'
import { connect } from 'react-redux'
import { InlineLoading } from 'carbon-components-react'

import {
  setModel,
  setActive,
  setPredictions,
  setActivePrediction
} from 'redux/autoLabel'

import styles from './AutoLabelPanel.module.css'

import objectDetector from '@cloud-annotations/object-detection'

const MODEL_PATH =
  '/api/proxy/s3.us-west.cloud-object-storage.test.appdomain.cloud/funky/model_web'

const MagicIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 37.99 33.99"
      className={styles.buttonIcon}
    >
      <path
        d="M26,12a3.49,3.49,0,0,0-4.95,0L2,31A3.5,3.5,0,0,0,7,36L26,17A3.49,3.49,0,0,0,26,12Zm-1,4-4.5,4.5-3-3L22,13a2.12,2.12,0,0,1,3,3Z"
        transform="translate(-1.01 -3)"
      />
      <path
        d="M25,10a6.84,6.84,0,0,0,7-7,6.84,6.84,0,0,0,7,7,6.84,6.84,0,0,0-7,7A6.84,6.84,0,0,0,25,10Z"
        transform="translate(-1.01 -3)"
      />
      <path
        d="M26,23a4.88,4.88,0,0,0,5-5,4.88,4.88,0,0,0,5,5,4.88,4.88,0,0,0-5,5A4.88,4.88,0,0,0,26,23Z"
        transform="translate(-1.01 -3)"
      />
      <path
        d="M5,10a6.84,6.84,0,0,0,7-7,6.84,6.84,0,0,0,7,7,6.84,6.84,0,0,0-7,7A6.84,6.84,0,0,0,5,10Z"
        transform="translate(-1.01 -3)"
      />
    </svg>
  )
}

const Expanded = ({ handleClick }) => {
  const handleLabel = useCallback(() => {}, [])
  return (
    <div className={styles.wrapper}>
      <div className={styles.titleBar}>
        <div className={styles.title}>Auto label</div>
        <div className={styles.done} onClick={handleClick}>
          Done
        </div>
      </div>
      <div className={styles.buttonLabel} onClick={handleLabel}>
        <div className={styles.buttonText}>Accept label</div>
      </div>
      <div className={styles.buttonLabelAll}>
        <div className={styles.buttonText}>Accept all labels</div>
      </div>
      <div className={styles.buttonNext}>
        <div className={styles.buttonText}>Next</div>
      </div>
    </div>
  )
}

const LoadingModel = ({ handleClick }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.buttonLoading} onClick={handleClick}>
        <div className={styles.buttonText}>Loading model</div>
        <div className={styles.loading}>
          <InlineLoading success={false} />
        </div>
      </div>
    </div>
  )
}

const Collapsed = ({ handleClick }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.buttonAutoLabel} onClick={handleClick}>
        <div className={styles.buttonText}>Auto label</div>
        <MagicIcon />
      </div>
    </div>
  )
}

const AutoLabelPanel = ({
  expanded,
  onExpand,
  onCollapse,
  model,
  setModel,
  setActive
}) => {
  const handleClick = useCallback(() => {
    if (expanded) {
      setActive(false)
      onCollapse()
    } else {
      setActive(true)
      if (model === undefined) {
        objectDetector.load(MODEL_PATH).then(async model => {
          // warm up the model
          const image = new ImageData(1, 1)
          await model.detect(image)
          setModel(model)
        })
      }
      onExpand()
    }
  }, [expanded, model, onCollapse, onExpand, setActive, setModel])

  if (expanded && model === undefined) {
    return <LoadingModel handleClick={handleClick} />
  }
  if (expanded) {
    return <Expanded handleClick={handleClick} />
  }
  return <Collapsed handleClick={handleClick} />
}

const mapStateToProps = state => ({
  model: state.autoLabel.model
})

const mapDispatchToProps = {
  setModel,
  setActive
}
export default connect(mapStateToProps, mapDispatchToProps)(AutoLabelPanel)
