import React, { useRef, useCallback, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import PostAuthor from './PostAuthor'
import LikeButton from './LikeButton'
import MediaDisplay from './MediaDisplay'
import { UserContext } from './context/userContext'
import { CARD_DEFAULT_ORDER } from './postLayoutConstants'
import API from './axios.js'

const scrollTop = () => window.scrollTo(0, 0)

const resolveMediaUrl = (path, folder = 'mern') => {
  const assetsBase =
    import.meta.env.VITE_API_ASSETS_URL ||
    'https://pub-ec6d8fbb35c24f83a77c02047b5c8f13.r2.dev'
  if (!path || path.includes('placeholder'))
    return `${assetsBase}/${folder}/post-placeholder.png`
  if (path.startsWith('http')) return path
  const cleanPath = path.startsWith(`${folder}/`) ? path : `${folder}/${path}`
  return `${assetsBase}/${cleanPath}`
}

const PostItem = ({
  postID, category, title, description,
  authorID, thumbnail, videoUrl, createdAt,
  likesCount = 0, likedBy = [],
}) => {
  const navigate      = useNavigate()
  const { cardOrder } = useContext(UserContext)

  const articleRef  = useRef(null)
  const prefetchRef = useRef(null)

  const order = (cardOrder && cardOrder.length > 0) ? cardOrder : CARD_DEFAULT_ORDER

  const finalThumbnail = resolveMediaUrl(thumbnail)
  const finalVideo     = resolveMediaUrl(videoUrl)

  const handleMouseEnter = useCallback(async (e) => {
    const video = e.currentTarget.querySelector('video')
    if (video) { video.muted = false; video.play().catch(() => {}) }
    if (!prefetchRef.current) {
      try {
        const { data } = await API.get(`/posts/${postID}`)
        prefetchRef.current = data
      } catch { }
    }
  }, [postID])

  const handleMouseLeave = (e) => {
    const video = e.currentTarget.querySelector('video')
    if (video) { video.pause(); video.currentTime = 0 }
  }

  const stripHtml = (html) =>
    html?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() || ''

  const shortDescription =
    stripHtml(description).length > 145
      ? stripHtml(description).substr(0, 145) + '...'
      : stripHtml(description)

  const handleClick = () => {
    scrollTop()
    navigate(`/posts/${postID}`)
  }

  const renderSection = (section) => {
    switch (section) {
      case 'thumbnail':
        return (
          <div key="thumbnail" className="post__thumbnail"
            onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
          >
            {videoUrl ? (
              <MediaDisplay type="video" controls={false} muted={false}
                src={finalVideo} poster={finalThumbnail} alt={title} />
            ) : (
              <MediaDisplay type="image" src={finalThumbnail} alt={title} />
            )}
          </div>
        )
      case 'title':
        return <h3 key="title">{title}</h3>
      case 'description':
        return <p key="description">{shortDescription}</p>
      case 'footer':
        return (
          <div key="footer" className="post__footer" onClick={e => e.stopPropagation()}>
            <PostAuthor authorID={authorID} createdAt={createdAt} />
            <div className="post__actions">
              <LikeButton postID={postID} initialLikesCount={likesCount} initialLikedBy={likedBy} />
              <span
                className="btn category post__category-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/posts/categories/${category}`)
                  scrollTop()
                }}
              >
                {category?.length > 12 ? `${category.substring(0, 12)}...` : category}
              </span>
            </div>
          </div>
        )
      default: return null
    }
  }

  return (
    <motion.article
      ref={articleRef}
      className="post"
      whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="post__content">
        {order.map(section => renderSection(section))}
      </div>
    </motion.article>
  )
}

export default PostItem