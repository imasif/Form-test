import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addTab, reorderTabs, setActiveTab } from '../../slices/tabsSlice'
import { useState, useRef, useEffect } from 'react'
// eslint-disable-next-line no-unused-vars
import { useSpring, animated } from '@react-spring/web'
import Copy from '../../assets/copy.svg'
import Delete from '../../assets/delete.svg'
import Flag from '../../assets/flag.svg'
import Duplicate from '../../assets/duplicate.svg'
import Rename from '../../assets/endingNormal.svg'
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    useSortable,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'

function DividerAnimated({ hovered, onClick }) {
    const widthChange = useSpring({
        width: hovered ? '55px' : '16px',
        config: { tension: 200, friction: 24 },
    })
    const iconAppearance = useSpring({
        opacity: hovered ? 1 : 0,
        marginTop: hovered ? '0' : '8px',
        config: { tension: 200, friction: 24 },
    })
    return (
        <div
            className="relative cursor-pointer"
            onClick={hovered ? onClick : undefined}
        >
            <animated.div
                style={widthChange}
                className="flex items-center text-gray-800 h-1 border-b border-dashed border-black"
            >
                <animated.div style={iconAppearance}>
                    <span className="mx-4.5 devider-plus select-none">＋</span>
                </animated.div>
            </animated.div>
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

function SortableTab({
    tab,
    idx,
    activeTab,
    onTabClick,
    dotRef,
    dotSpring,
    dotMenuOpen,
    setDotMenuOpen,
    setDotMenuPos,
    dotMenuPos,
    Flag,
    Rename,
    Copy,
    Duplicate,
    Delete,
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: tab.id })
    const style = {
        // Fix: force transform to only translateX, no scale/skew
        transform: transform
            ? `translate3d(${transform.x}px, 0, 0)`
            : undefined,
        transition,
        zIndex: isDragging ? 99 : 1,
        opacity: isDragging ? 0.7 : 1,
        boxShadow: isDragging ? '0 4px 16px rgba(0,0,0,0.18)' : undefined,
        cursor: isDragging ? 'grabbing' : 'grab',
    }
    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="flex items-center group"
        >
            <div
                className={`flex items-center px-4 py-1 whitespace-nowrap text-sm cursor-pointer select-none rounded-md gap-1 tab-bar-item overflow-hidden ${
                    tab.id === activeTab
                        ? 'active-tab border border-solid border-gray-400 '
                        : 'inactive-tab'
                }`}
                tabIndex={0}
                style={{ minWidth: 0, width: '100%' }}
                onClick={() => onTabClick(tab.id, idx)}
            >
                {/* Icon rendering for tab */}
                {tab.icon_normal && tab.icon_active ? (
                    <span className="flex items-center justify-center w-5 h-5 shrink-0">
                        {tab.id === activeTab ? (
                            <img
                                src={tab.icon_active}
                                alt="active icon"
                                className="w-4 h-4"
                            />
                        ) : (
                            <img
                                src={tab.icon_normal}
                                alt="tab icon"
                                className="w-4 h-4"
                            />
                        )}
                    </span>
                ) : null}
                <span className={`w-full`}>{tab.name}</span>
                {/* Three dots and menu for active tab */}
                {tab.id === activeTab && (
                    <>
                        <animated.span
                            ref={dotRef}
                            style={dotSpring}
                            className="ml-2 flex items-center space-x-1 relative cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation()
                                const rect =
                                    e.currentTarget.getBoundingClientRect()
                                const menuHeight = 220
                                let placement = 'bottom'
                                let y = rect.bottom + window.scrollY
                                if (
                                    window.innerHeight - rect.bottom <
                                    menuHeight
                                ) {
                                    placement = 'top'
                                    y = rect.top + window.scrollY - menuHeight
                                }
                                setDotMenuPos({
                                    x: rect.left + rect.width / 2,
                                    y,
                                    placement,
                                })
                                setDotMenuOpen(true)
                            }}
                        >
                            <div className="w-0.5 h-0.5 three-dot-color rounded-full m-0.5 block"></div>
                            <div className="w-0.5 h-0.5 three-dot-color rounded-full m-0.5 block"></div>
                            <div className="w-0.5 h-0.5 three-dot-color rounded-full m-0.5 block"></div>
                        </animated.span>
                        {dotMenuOpen && (
                            <div
                                className="absolute z-50 min-w-[220px] bg-white border border-gray-200 rounded-2xl shadow-xl py-0 pb-1 animate-fadein overflow-hidden context-menu"
                                style={{
                                    left: dotMenuPos.x,
                                    top: dotMenuPos.y + 10,
                                    transform: 'translateX(-50%)',
                                }}
                            >
                                <div className="px-5 pt-4 pb-2 text-base text-gray-900 border-b border-gray-100 context-menu-title">
                                    Settings
                                </div>
                                <button className="flex items-center gap-1 w-full text-left px-5 py-1.5 hover:bg-gray-50 text-gray-800 text-sm">
                                    <span>
                                        <img
                                            src={Flag}
                                            alt="Flag icon"
                                            className="w-4 h-4"
                                        />
                                    </span>
                                    Set as first page
                                </button>
                                <button className="flex items-center gap-1 w-full text-left px-5 py-1.5 hover:bg-gray-50 text-gray-800 text-sm">
                                    <span>
                                        <img
                                            src={Rename}
                                            alt="Rename icon"
                                            className="w-4 h-4"
                                        />
                                    </span>
                                    Rename
                                </button>
                                <button className="flex items-center gap-1 w-full text-left px-5 py-1.5 hover:bg-gray-50 text-gray-800 text-sm">
                                    <span>
                                        <img
                                            src={Copy}
                                            alt="Copy icon"
                                            className="w-4 h-4"
                                        />
                                    </span>
                                    Copy
                                </button>
                                <button className="flex items-center gap-1 w-full text-left px-5 py-1.5 hover:bg-gray-50 text-gray-800 text-sm">
                                    <span>
                                        <img
                                            src={Duplicate}
                                            alt="Duplicate icon"
                                            className="w-4 h-4"
                                        />
                                    </span>
                                    Duplicate
                                </button>
                                <div className="my-1 border-t border-gray-100"></div>
                                <button className="flex items-center gap-3 w-full text-left px-5 py-1.5 hover:bg-red-50 text-red-600 text-sm">
                                    <span>
                                        <img
                                            src={Delete}
                                            alt="Delete icon"
                                            className="w-4 h-4"
                                        />
                                    </span>
                                    Delete
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default function Home() {
    const tabs = useSelector((state) => state.tabs.tabs || state.tabs)
    const activeTab = useSelector((state) => state.tabs.activeTabId)
    const dispatch = useDispatch()
    const [dividerHover, setDividerHover] = useState(null)
    const dotRef = useRef(null)

    const [dotMenuOpen, setDotMenuOpen] = useState(false)
    const [dotMenuPos, setDotMenuPos] = useState({
        x: 0,
        y: 0,
        placement: 'bottom',
    })
    const [pages, setPages] = useState(tabs.map(() => ''))
    const [slideDir, setSlideDir] = useState('right')
    const [isDragging, setIsDragging] = useState(false)

    const dotSpring = useSpring({
        display: activeTab ? 'block' : 'none',
        opacity: activeTab ? 1 : 0,
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
        setSlideDir('right')
        // activeTabId is set in slice
    }

    const handleTabClick = (id, idx) => {
        if (id === activeTab) return
        setSlideDir(
            tabs.findIndex((t) => t.id === activeTab) < idx ? 'right' : 'left'
        )
        dispatch(setActiveTab(id))
    }

    // DnD-kit sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
                axis: 'x', // Constrain dragging to horizontal axis only
            },
        })
    )

    const [tabOrder, setTabOrder] = useState(tabs.map((t) => t.id))
    useEffect(() => {
        setTabOrder(tabs.map((t) => t.id))
    }, [tabs])

    function handleDragStart() {
        setIsDragging(true)
    }
    function handleDragEnd(event) {
        setIsDragging(false)
        const { active, over } = event
        if (active && over && active.id !== over.id) {
            const oldIndex = tabOrder.indexOf(active.id)
            const newIndex = tabOrder.indexOf(over.id)
            const newOrder = arrayMove(tabOrder, oldIndex, newIndex)
            setTabOrder(newOrder)
            // Reorder tabs in Redux
            const newTabs = newOrder.map((id) => tabs.find((t) => t.id === id))
            dispatch(reorderTabs(newTabs))
        }
    }

    return (
        <>
            <div className="flex p-5 overflow-x-auto border-b border-gray-300 bg-white w-4xl">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToHorizontalAxis]}
                >
                    <SortableContext
                        items={tabOrder}
                        strategy={horizontalListSortingStrategy}
                    >
                        <div
                            className={`flex items-center tab-bar-view scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent sm:overflow-x-auto overflow-y-hidden h-9 sm:scrollbar-thin sm:scrollbar-thumb-gray-300 sm:scrollbar-track-transparent${
                                isDragging ? ' no-vertical-scroll' : ''
                            }`}
                            style={
                                isDragging
                                    ? {
                                          overflowY: 'hidden',
                                          overflowX: 'hidden',
                                      }
                                    : {}
                            }
                        >
                            {tabOrder.map((id, idx) => {
                                const tab = tabs.find((t) => t.id === id)
                                return (
                                    <React.Fragment key={tab.id}>
                                        <SortableTab
                                            tab={tab}
                                            idx={idx}
                                            activeTab={activeTab}
                                            onTabClick={handleTabClick}
                                            dotRef={dotRef}
                                            dotSpring={dotSpring}
                                            dotMenuOpen={dotMenuOpen}
                                            setDotMenuOpen={setDotMenuOpen}
                                            setDotMenuPos={setDotMenuPos}
                                            dotMenuPos={dotMenuPos}
                                            Flag={Flag}
                                            Rename={Rename}
                                            Copy={Copy}
                                            Duplicate={Duplicate}
                                            Delete={Delete}
                                        ></SortableTab>
                                        {/* Hide divider when dragging */}
                                        {idx !== tabs.length - 1 ? (
                                            <div
                                                className={`devider ${
                                                    isDragging
                                                        ? 'opacity-0'
                                                        : ''
                                                }`}
                                                onMouseEnter={() =>
                                                    setDividerHover(tab.id)
                                                }
                                                onMouseLeave={() =>
                                                    setDividerHover(null)
                                                }
                                                key={`divider-${tab.id}`}
                                            >
                                                <DividerAnimated
                                                    hovered={
                                                        dividerHover === tab.id
                                                    }
                                                    onClick={
                                                        dividerHover === tab.id
                                                            ? () => {
                                                                  const newId =
                                                                      Date.now()
                                                                  const insertIdx =
                                                                      idx + 1
                                                                  const newTab =
                                                                      {
                                                                          id: newId,
                                                                          name: `Page ${
                                                                              tabs.length +
                                                                              1
                                                                          }`,
                                                                      }
                                                                  // Insert new tab at insertIdx
                                                                  const newTabs =
                                                                      [
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
                                                                      reorderTabs(
                                                                          newTabs
                                                                      )
                                                                  )
                                                                  setPages(
                                                                      (
                                                                          prev
                                                                      ) => [
                                                                          ...prev.slice(
                                                                              0,
                                                                              insertIdx
                                                                          ),
                                                                          '',
                                                                          ...prev.slice(
                                                                              insertIdx
                                                                          ),
                                                                      ]
                                                                  )
                                                                  dispatch(
                                                                      setActiveTab(
                                                                          newId
                                                                      )
                                                                  )
                                                                  setSlideDir(
                                                                      'right'
                                                                  )
                                                              }
                                                            : undefined
                                                    }
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                className={`w-4 h-1.5 border-b border-dashed border-black ${
                                                    isDragging
                                                        ? 'opacity-0'
                                                        : ''
                                                }`}
                                                key={`divider-last-${tab.id}`}
                                            ></div>
                                        )}
                                    </React.Fragment>
                                )
                            })}
                        </div>
                    </SortableContext>
                </DndContext>
                <button
                    onClick={handleAddTab}
                    className="flex items-center px-4 whitespace-nowrap text-sm border border-dotted border-gray-300 cursor-pointer select-none rounded-md text-gray-800 h-7.5 mt-1"
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
