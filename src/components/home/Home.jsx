import { useSelector, useDispatch } from 'react-redux'
import { addTab, removeTab, reorderTabs } from '../../slices/tabsSlice'
import { useState, useRef, useEffect } from 'react'
import { useSpring, animated } from '@react-spring/web'

function DividerAnimated({ hovered, onClick }) {
    const fadeIn = useSpring({
        opacity: hovered ? 1 : 0,
        config: { tension: 200, friction: 24 },
    })
    const fadeOut = useSpring({
        opacity: hovered ? 0 : 1,
        config: { tension: 200, friction: 24 },
    })
    return (
        <div
            className="relative cursor-pointer"
            onClick={hovered ? onClick : undefined}
        >
            {hovered ? (
                <animated.div
                    style={fadeIn}
                    className="flex items-center text-gray-800"
                >
                    <div className="w-5 h-full border-b border-dashed border-black"></div>
                    <span className="mx-1 devider-plus select-none">＋</span>
                    <div className="w-5 h-full border-b border-dashed border-black"></div>
                </animated.div>
            ) : (
                <animated.div
                    style={fadeOut}
                    className="flex items-center text-gray-800"
                >
                    <div className="w-5 h-full border-b border-dashed border-black"></div>
                </animated.div>
            )}
        </div>
    )
}

function PageSlider({ children, direction }) {
    // direction: 'left' or 'right'
    const slide = useSpring({
        from: {
            opacity: 0,
            transform: `translateX(${
                direction === 'right' ? '100%' : '-100%'
            })`,
        },
        to: { opacity: 1, transform: 'translateX(0%)' },
        config: { tension: 220, friction: 28 },
        // reset: true,
    })
    return (
        <animated.div style={slide} className="w-full">
            {children}
        </animated.div>
    )
}

export default function Home() {
    const tabs = useSelector((state) => state.tabs)
    const dispatch = useDispatch()
    const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? 1)
    const [activeTabHovered, setActiveTabHovered] = useState(false)
    const [dividerHover, setDividerHover] = useState(null)
    const dragTabId = useRef(null)
    const [pages, setPages] = useState(tabs.map(() => ''))
    const [lastTab, setLastTab] = useState(activeTab)
    const [slideDir, setSlideDir] = useState('right')
    const [dotMenuOpen, setDotMenuOpen] = useState(false)
    const [dotMenuPos, setDotMenuPos] = useState({
        x: 0,
        y: 0,
        placement: 'bottom',
    })
    const dotRef = useRef(null)

    const dotSpring = useSpring({
        display: activeTabHovered ? 'block' : 'none',
        opacity: activeTabHovered ? 1 : 0,
        config: { tension: 200, friction: 24 },
    })

    // Close menu on outside click
    useEffect(() => {
        if (!dotMenuOpen) return
        const handler = (e) => {
            if (dotRef.current && !dotRef.current.contains(e.target)) {
                setDotMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [dotMenuOpen])

    const handleAddTab = () => {
        const newId = Date.now()
        dispatch(addTab({ id: newId, name: `Page ${tabs.length + 1}` }))
        setPages([...pages, ''])
        setLastTab(activeTab)
        setSlideDir('right')
        setActiveTab(newId)
        setActiveTabHovered(false)
    }

    const handleTabClick = (id, idx) => {
        if (id === activeTab) return
        setSlideDir(
            tabs.findIndex((t) => t.id === activeTab) < idx ? 'right' : 'left'
        )
        setLastTab(activeTab)
        setActiveTab(id)
        setActiveTabHovered(true)
    }

    const handleRemoveTab = (e, id) => {
        e.stopPropagation()
        dispatch(removeTab(id))
        if (activeTab === id) {
            const nextTab = tabs.find((t) => t.id !== id)
            setActiveTab(nextTab?.id ?? null)
        }
    }

    // Drag and drop handlers
    const handleDragStart = (e, id) => {
        dragTabId.current = id
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e, id) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = (e, id) => {
        e.preventDefault()
        const fromId = dragTabId.current
        if (fromId === id) return
        const fromIndex = tabs.findIndex((tab) => tab.id === fromId)
        const toIndex = tabs.findIndex((tab) => tab.id === id)
        if (fromIndex === -1 || toIndex === -1) return
        const newTabs = [...tabs]
        const [moved] = newTabs.splice(fromIndex, 1)
        newTabs.splice(toIndex, 0, moved)
        dispatch(reorderTabs(newTabs))
        dragTabId.current = null
    }

    return (
        <>
            <div className="flex p-5 overflow-x-auto border-b border-gray-300 bg-white w-4xl">
                <div
                    className="flex items-center tab-bar-view"
                    onMouseLeave={() =>
                        dotMenuOpen ? null : setActiveTabHovered(false)
                    }
                >
                    {tabs.map((tab, idx) => (
                        <div key={tab.id} className="flex items-center group">
                            <div
                                draggable
                                onDragStart={(e) => handleDragStart(e, tab.id)}
                                onDragOver={(e) => handleDragOver(e, tab.id)}
                                onDrop={(e) => handleDrop(e, tab.id)}
                                onClick={() => handleTabClick(tab.id, idx)}
                                onMouseOver={() =>
                                    tab.id === activeTab
                                        ? setActiveTabHovered(true)
                                        : setActiveTabHovered(false)
                                }
                                onMouseLeave={() =>
                                    tab.id === activeTab
                                        ? dotMenuOpen
                                            ? setActiveTabHovered(true)
                                            : setActiveTabHovered(false)
                                        : setActiveTabHovered(true)
                                }
                                onContextMenu={(e) =>
                                    handleRemoveTab(e, tab.id)
                                }
                                className={`flex items-center px-4 py-1 whitespace-nowrap text-sm cursor-pointer select-none rounded-md
                        ${
                            tab.id === activeTab
                                ? 'active-tab border border-solid border-gray-400 '
                                : 'inactive-tab'
                        }
                        }`}
                                style={{
                                    opacity:
                                        dragTabId.current === tab.id ? 0.5 : 1,
                                }}
                            >
                                {tab.name}
                                {tab.id === activeTab && (
                                    <>
                                        <animated.span
                                            ref={dotRef}
                                            style={dotSpring}
                                            className="ml-2 flex items-center space-x-1 relative"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                // Get bounding rect for placement
                                                const rect =
                                                    e.currentTarget.getBoundingClientRect()
                                                const menuHeight = 120 // px, adjust as needed
                                                let placement = 'bottom'
                                                let y =
                                                    rect.bottom + window.scrollY
                                                if (
                                                    window.innerHeight -
                                                        rect.bottom <
                                                    menuHeight
                                                ) {
                                                    placement = 'top'
                                                    y =
                                                        rect.top +
                                                        window.scrollY -
                                                        menuHeight
                                                }
                                                setDotMenuPos({
                                                    x:
                                                        rect.left +
                                                        rect.width / 2,
                                                    y,
                                                    placement,
                                                })
                                                setDotMenuOpen(true)
                                            }}
                                        >
                                            <div className="w-0.5 h-0.5 bg-gray-500 rounded-full m-0.5 block"></div>
                                            <div className="w-0.5 h-0.5 bg-gray-500 rounded-full m-0.5 block"></div>
                                            <div className="w-0.5 h-0.5 bg-gray-500 rounded-full m-0.5 block"></div>
                                        </animated.span>
                                        {dotMenuOpen && (
                                            <div
                                                className="absolute z-50 min-w-[220px] bg-white border border-gray-200 rounded-2xl shadow-xl py-0 animate-fadein overflow-hidden font-[\'BL\ Melody\',_sans-serif]"
                                                style={{
                                                    left: dotMenuPos.x,
                                                    top: dotMenuPos.y + 10,
                                                    transform:
                                                        'translateX(-50%)',
                                                }}
                                            >
                                                <div className="px-5 pt-4 pb-2 text-base text-gray-900 border-b border-gray-100">
                                                    Settings
                                                </div>
                                                <button className="flex items-center gap-3 w-full text-left px-5 py-2.5 hover:bg-gray-50 text-gray-800 text-sm">
                                                    <span className="text-blue-500">
                                                        <svg
                                                            width="18"
                                                            height="18"
                                                            fill="none"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path
                                                                d="M4 10l4 4 8-8"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        </svg>
                                                    </span>
                                                    Set as first page
                                                </button>
                                                <button className="flex items-center gap-3 w-full text-left px-5 py-2.5 hover:bg-gray-50 text-gray-800 text-sm">
                                                    <span className="text-gray-500">
                                                        <svg
                                                            width="18"
                                                            height="18"
                                                            fill="none"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path
                                                                d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                                                                stroke="currentColor"
                                                                strokeWidth="1.5"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        </svg>
                                                    </span>
                                                    Rename
                                                </button>
                                                <button className="flex items-center gap-3 w-full text-left px-5 py-2.5 hover:bg-gray-50 text-gray-800 text-sm">
                                                    <span className="text-gray-500">
                                                        <svg
                                                            width="18"
                                                            height="18"
                                                            fill="none"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <rect
                                                                x="4"
                                                                y="4"
                                                                width="12"
                                                                height="12"
                                                                rx="2"
                                                                stroke="currentColor"
                                                                strokeWidth="1.5"
                                                            />
                                                            <path
                                                                d="M8 8h4v4H8z"
                                                                fill="currentColor"
                                                            />
                                                        </svg>
                                                    </span>
                                                    Copy
                                                </button>
                                                <button className="flex items-center gap-3 w-full text-left px-5 py-2.5 hover:bg-gray-50 text-gray-800 text-sm">
                                                    <span className="text-gray-500">
                                                        <svg
                                                            width="18"
                                                            height="18"
                                                            fill="none"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <rect
                                                                x="4"
                                                                y="4"
                                                                width="12"
                                                                height="12"
                                                                rx="2"
                                                                stroke="currentColor"
                                                                strokeWidth="1.5"
                                                            />
                                                            <path
                                                                d="M8 8h4v4H8z"
                                                                fill="currentColor"
                                                            />
                                                        </svg>
                                                    </span>
                                                    Duplicate
                                                </button>
                                                <div className="my-1 border-t border-gray-100"></div>
                                                <button className="flex items-center gap-3 w-full text-left px-5 py-2.5 hover:bg-red-50 text-red-600 text-sm">
                                                    <span>
                                                        <svg
                                                            width="18"
                                                            height="18"
                                                            fill="none"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path
                                                                d="M6 6l8 8M6 14L14 6"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        </svg>
                                                    </span>
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            <div
                                className="devider"
                                onMouseEnter={() => setDividerHover(tab.id)}
                                onMouseLeave={() => setDividerHover(null)}
                            >
                                {idx !== tabs.length - 1 ? (
                                    <DividerAnimated
                                        hovered={dividerHover === tab.id}
                                        onClick={
                                            dividerHover === tab.id
                                                ? () => {
                                                      const newId = Date.now()
                                                      const insertIdx = idx + 1
                                                      const newTab = {
                                                          id: newId,
                                                          name: `Page ${
                                                              tabs.length + 1
                                                          }`,
                                                      }
                                                      // Insert new tab at insertIdx
                                                      const newTabs = [
                                                          ...tabs.slice(
                                                              0,
                                                              insertIdx
                                                          ),
                                                          newTab,
                                                          ...tabs.slice(
                                                              insertIdx
                                                          ),
                                                      ]
                                                      dispatch(
                                                          reorderTabs(newTabs)
                                                      )
                                                      setPages((prev) => [
                                                          ...prev.slice(
                                                              0,
                                                              insertIdx
                                                          ),
                                                          '',
                                                          ...prev.slice(
                                                              insertIdx
                                                          ),
                                                      ])
                                                      setActiveTab(newId)
                                                      setSlideDir('right')
                                                      setActiveTabHovered(false)
                                                  }
                                                : undefined
                                        }
                                    />
                                ) : (
                                    <div className="w-5 h-full border-b border-dashed border-black"></div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    onClick={handleAddTab}
                    className="flex items-center px-4 whitespace-nowrap text-sm border border-dotted border-gray-300 cursor-pointer select-none rounded-md text-gray-800"
                >
                    ＋ Add page
                </button>
            </div>
            <div className="relative overflow-x-hidden w-full min-h-[200px] flex justify-center items-center bg-gray-50">
                {tabs.map(
                    (tab, idx) =>
                        tab.id === activeTab && (
                            <PageSlider key={tab.id} direction={slideDir}>
                                <div className="w-full h-full flex flex-col items-center justify-center p-8">
                                    {pages[idx] || (
                                        <span className="text-gray-400">
                                            {tab.name} content goes here
                                        </span>
                                    )}
                                </div>
                            </PageSlider>
                        )
                )}
            </div>
        </>
    )
}
