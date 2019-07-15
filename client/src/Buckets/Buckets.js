import React, { useState, useEffect, useCallback } from 'react'
import GoogleAnalytics from 'react-ga'
import { connect } from 'react-redux'
import { loadBuckets } from 'redux/buckets'

import Table from './TableV2'
import CreateModal from './CreateModal'
import DeleteModal from './DeleteModal'
import COS from 'api/COSv2'

import history from 'globalHistory'
import styles from './Buckets.module.css'

const Chevron = () => (
  <svg className={styles.chevronIcon} viewBox="0 0 12 7">
    <path
      fill-rule="nonzero"
      d="M6.002 5.55L11.27 0l.726.685L6.003 7 0 .685.726 0z"
    />
  </svg>
)

const Buckets = ({
  profile,
  buckets,
  activeResource,
  resources,
  accounts,
  dispatch
}) => {
  const [isCreateBucketModalOpen, setIsCreateBucketModalOpen] = useState(false)
  const [bucketToDelete, setBucketToDelete] = useState(false)

  const [listOfLoadingBuckets, setListOfLoadingBuckets] = useState([])

  const dispatchLoadBuckets = useCallback(
    async chosenInstance => {
      try {
        dispatch(await loadBuckets(chosenInstance))
      } catch (error) {
        console.error(error)
      }
    },
    [dispatch]
  )

  useEffect(() => {
    GoogleAnalytics.pageview('buckets')
  }, [])

  useEffect(() => {
    if (activeResource) {
      dispatchLoadBuckets(activeResource)
    }
  }, [activeResource, dispatchLoadBuckets])

  const handleRowSelected = useCallback(
    id => {
      const bucket = buckets.filter(bucket => bucket.id === id)[0]
      history.push(`/${bucket.name}?location=${bucket.location}`)
    },
    [buckets]
  )

  const handleCreateBucket = useCallback(() => {
    setIsCreateBucketModalOpen(true)
  }, [])

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateBucketModalOpen(false)
  }, [])

  const handleSubmitCreateModal = useCallback(
    bucketName => {
      dispatchLoadBuckets()
      setIsCreateBucketModalOpen(false)
      history.push(`/${bucketName}`)
    },
    [dispatchLoadBuckets]
  )

  const handleDeleteBucket = useCallback(bucketName => {
    setBucketToDelete(bucketName)
  }, [])

  const handleCloseDeleteModal = useCallback(() => {
    setBucketToDelete(false)
  }, [])

  const handleSubmitDeleteModal = useCallback(
    async bucketName => {
      setBucketToDelete(false)
      setListOfLoadingBuckets(list => [...list, bucketName])
      const endpoint = localStorage.getItem('loginUrl')
      try {
        await new COS(endpoint).deleteBucket(bucketName)
      } catch (error) {
        console.error(error)
      }
      await dispatchLoadBuckets()
      setListOfLoadingBuckets(list => list.filter(b => b !== bucketName))
    },
    [dispatchLoadBuckets]
  )

  const activeAccount = accounts.accounts.find(
    account => accounts.activeAccount === account.accountId
  )

  return (
    <div className={styles.wrapper}>
      <div className={styles.titleBar}>
        <div className={styles.title}>
          <span className={styles.titlePrefix}>IBM</span>&nbsp;&nbsp;Cloud
          Annotations
        </div>
        <div className={styles.account}>
          <div className={styles.accountName}>
            {resources && resources[0] && resources[0].name}
          </div>
          <Chevron />
        </div>
        <div className={styles.account}>
          <div className={styles.accountName}>
            {activeAccount &&
              activeAccount.softlayer &&
              `${activeAccount.softlayer} - `}
            {activeAccount && activeAccount.name}
          </div>
          <Chevron />
        </div>
        <div className={styles.profileWrapper}>
          <img alt="" className={styles.profile} src={profile.photo} />
        </div>
      </div>
      <DeleteModal
        isOpen={bucketToDelete}
        onClose={handleCloseDeleteModal}
        onSubmit={handleSubmitDeleteModal}
        itemToDelete={bucketToDelete}
      />
      <CreateModal
        isOpen={isCreateBucketModalOpen}
        onClose={handleCloseCreateModal}
        onSubmit={handleSubmitCreateModal}
      />
      <Table
        buckets={buckets}
        listOfLoadingBuckets={listOfLoadingBuckets}
        onDeleteBucket={handleDeleteBucket}
        onCreateBucket={handleCreateBucket}
        onRowSelected={handleRowSelected}
      />
    </div>
  )
}

const mapStateToProps = state => ({
  activeResource: state.resources.activeResource,
  accounts: state.accounts,
  resources: state.resources.resources,
  buckets: state.buckets,
  profile: state.profile
})
export default connect(mapStateToProps)(Buckets)