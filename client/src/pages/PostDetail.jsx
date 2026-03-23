import React, { useContext, useEffect, useRef, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import PostAuthor from './components/PostAuthor'
import LikeButton from './components/LikeButton'
import { UserContext } from './components/context/userContext'
import Loader from './components/Loader'
import DeletePost from './DeletePost'
import API from './components/axios.js'

export const DETAIL_DEFAULT_ORDER = ['thumbnail', 'meta', 'title', 'description']
const STORAGE_KEY = 'postDetailLayoutOrder'

const loadDetailOrder = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (
        Array.isArray(parsed) &&
        parsed.length === DETAIL_DEFAULT_ORDER.length &&
        DETAIL_DEFAULT_ORDER.every(s => parsed.includes(s))
      ) return parsed
    }
  } catch { }
  return [...DETAIL_DEFAULT_ORDER]
}

const saveDetailOrder = (order) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(order)) } catch { }
}

export const DETAIL_SECTION_LABELS = {
  thumbnail:   '🖼  Thumbnail',
  title:       '✏️  Title',
  description: '📝  Description',
  meta:        '👤  Author & Like',
}

const PostDetail = () => {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [post, setPost]             = useState(null)
  const [isLoading, setIsLoading]   = useState(false)
  const [isDragMode, setIsDragMode] = useState(false)
  const [savedOrder, setSavedOrder] = useState(loadDetailOrder)
  const [dragOrder, setDragOrder] = useState([...loadDetailOrder()])
  const [navigating, setNavigating] = useState(false)

  const dragItem     = useRef(null)
  const dragOverItem = useRef(null)

  const { currentUser } = useContext(UserContext)
  const assetsBase = import.meta.env.VITE_API_ASSETS_URL

  useEffect(() => {
    const getPost = async () => {
      setIsLoading(true)
      try {
        const res = await API.get(`/posts/${id}`)
        setPost(res?.data)
      } catch (err) { console.error(err) }
      setIsLoading(false)
    }
    getPost()
  }, [id])

  const enterDragMode = () => { setDragOrder([...savedOrder]); setIsDragMode(true) }

  const handleDone = () => {
    setSavedOrder([...dragOrder])
    saveDetailOrder(dragOrder)
    setIsDragMode(false)
  }

  const handleReset = () => {
    const def = [...DETAIL_DEFAULT_ORDER]
    setSavedOrder(def)
    setDragOrder(def)
    saveDetailOrder(def)
    setIsDragMode(false)
  }
  
  const handleBack = () => {
    if (navigating) return
    setNavigating(true)
    navigate(-1)
  }

  const handleDragStart = (i) => { dragItem.current = i }
  const handleDragEnter = (i) => { dragOverItem.current = i }
  const handleDragEnd   = () => {
    if (dragItem.current === null || dragOverItem.current === null) return
    if (dragItem.current === dragOverItem.current) {
      dragItem.current = dragOverItem.current = null
      return
    }
    const next = [...dragOrder]
    const [moved] = next.splice(dragItem.current, 1)
    next.splice(dragOverItem.current, 0, moved)
    dragItem.current = dragOverItem.current = null
    setDragOrder(next)
  }

  const resolveUrl = (path, folder = 'mern') => {
    if (!path || path.includes('placeholder'))
      return `${assetsBase}/${folder}/post-placeholder.png`
    if (path.startsWith('http')) return path
    const cleanPath = path.startsWith(`${folder}/`) ? path : `${folder}/${path}`
    return `${assetsBase}/${cleanPath}`
  }

  if (isLoading) return <Loader />
  if (!post)     return null

  const imageUrl = resolveUrl(post?.thumbnail)
  const videoUrl = resolveUrl(post?.videoUrl)
  const isOwner  = currentUser?.id === post?.creator?._id?.toString() || currentUser?.role === 'admin' || currentUser?.role === 'moderator'

  const renderSection = (section) => {
    switch (section) {
      case 'thumbnail':
        return (
          <motion.div key="thumbnail" className="pd__thumbnail"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.35, ease: 'easeOut' }}
          >
            {post.videoUrl
              ? <video src={videoUrl} poster={imageUrl} controls />
              : <img src={imageUrl} alt={post.title} />
            }
          </motion.div>
        )
      case 'meta':
        return (
          <motion.div key="meta" className="pd__meta"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
          >
            <PostAuthor authorID={post.creator} createdAt={post.createdAt} />
            <LikeButton
              postID={post._id}
              initialLikesCount={post.likesCount}
              initialLikedBy={post.likedBy}
            />
          </motion.div>
        )
      case 'title':
        return (
          <motion.h1 key="title" className="pd__title"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {post.title}
          </motion.h1>
        )
      case 'description':
        return (
          <motion.div key="description" className="pd__description"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            dangerouslySetInnerHTML={{ __html: post.description }}
          />
        )
      default: return null
    }
  }

  return (
    <motion.div className="pd"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Top bar */}
      <div className="pd__bar">
        <motion.button className="pd__back" onClick={handleBack}
          whileHover={{ x: -3 }} whileTap={{ scale: 0.95 }} disabled={navigating}
        >← Back</motion.button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <motion.button
            className="btn sm"
            onClick={isDragMode ? handleDone : enterDragMode}
            whileTap={{ scale: 0.95 }}
            style={{
              background: isDragMode ? 'var(--color-primary)' : undefined,
              color:      isDragMode ? '#fff'                  : undefined,
            }}
          >
            {isDragMode ? 'Save Layout' : '⠿ Layout'}
          </motion.button>

          {isOwner && (
            <div className="pd__owner-actions">
              <Link to={`/posts/${post._id}/edit`} className="btn sm primary">Edit</Link>
              <DeletePost postId={id} />
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="pd__body">
        <div className="pd__inner">
          {isDragMode ? (
            <>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
                textAlign: 'center', fontSize: '0.75rem', fontWeight: 700,
                color: 'var(--color-primary)', letterSpacing: '0.8px',
                textTransform: 'uppercase', marginBottom: 'var(--space-4)',
              }}>
                Drag to reorder — tap Save Layout when done
              </motion.p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {dragOrder.map((section, i) => (
                  <motion.div
                    key={section}
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragEnter={() => handleDragEnter(i)}
                    onDragEnd={handleDragEnd}
                    onDragOver={e => e.preventDefault()}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.18 }}
                    style={{
                      background: 'var(--color-surface)',
                      borderRadius: 'var(--radius-3)',
                      border: '1.5px dashed var(--color-primary-30)',
                      cursor: 'grab', overflow: 'hidden', userSelect: 'none',
                    }}
                  >
                    <div style={{
                      padding: 'var(--space-2) var(--space-4)',
                      display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                      borderBottom: '1px solid var(--color-border)',
                      background: 'var(--color-primary-10)',
                    }}>
                      <span style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: 'var(--color-primary-20)', color: 'var(--color-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.68rem', fontWeight: 700, flexShrink: 0,
                      }}>{i + 1}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)', flex: 1 }}>
                        {DETAIL_SECTION_LABELS[section]}
                      </span>
                      <span style={{ color: 'var(--color-text-muted)', opacity: 0.5, fontSize: '1rem' }}>⠿</span>
                    </div>
                    <div style={{ padding: 'var(--space-3) var(--space-4)', opacity: 0.8, pointerEvents: 'none' }}>
                      {renderSection(section)}
                    </div>
                  </motion.div>
                ))}
              </div>

              <button onClick={handleReset} style={{
                marginTop: 'var(--space-4)', display: 'block', width: '100%',
                padding: 'var(--space-2)', borderRadius: 'var(--radius-2)',
                border: '1px dashed var(--color-border)', background: 'transparent',
                color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)',
                cursor: 'pointer', fontFamily: 'var(--font-base)',
              }}>
                ↺ Reset to default
              </button>
            </>
          ) : (
            savedOrder.map(section => (
              <div key={section}>{renderSection(section)}</div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default PostDetail