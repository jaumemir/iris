import localforage from 'localforage'
import { handleErrors } from 'Utils'

const shrinkBlob = async (blob, height) => {
  return new Promise((resolve, _) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.height = height
      canvas.width = canvas.height * (img.width / img.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      ctx.canvas.toBlob(blob => {
        resolve(blob)
      })
    }
    img.src = URL.createObjectURL(blob)
  })
}

export default async (endpoint, bucket, imageUrl, forcedHeight) => {
  const baseUrl = `/api/proxy/${endpoint}/${bucket}/${imageUrl}`
  let blob = await localforage.getItem(imageUrl)

  if (blob === null || blob === '') {
    blob = await fetch(baseUrl)
      .then(handleErrors)
      .then(response => response.blob())

    if (forcedHeight) {
      blob = await shrinkBlob(blob, forcedHeight)
    }

    localforage.setItem(imageUrl, blob)
  }

  return { image: URL.createObjectURL(blob) }
}
