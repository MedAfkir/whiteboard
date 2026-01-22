# Whiteboard Application - Implementation Plan

## Overview
Building a high-performance, collaborative whiteboard application with React, Canvas, and Tailwind CSS, following Excalidraw's design philosophy with real-time collaboration via Liveblocks/Yjs.

---

## Phase 0: Project Setup & Foundation

### 0.1 Initialize Project
- [ ] Create Vite + React + TypeScript project
- [ ] Install and configure Tailwind CSS (tailwind.config.js, postcss.config.js)
- [ ] Set up project structure (components/, stores/, lib/, types/, utils/)
- [ ] Configure TypeScript with strict mode
- [ ] Add ESLint and Prettier configurations

### 0.2 Install Core Dependencies
- [ ] Install Zustand for state management
- [ ] Install Fabric.js or set up raw Canvas API
- [ ] Install Perfect Freehand for drawing tools
- [ ] Install Rough.js for hand-drawn aesthetic (optional)
- [ ] Install Liveblocks client and React SDK
- [ ] Install Yjs and y-websocket for CRDTs

### 0.3 Type Definitions
- [ ] Create [src/types/whiteboard.types.ts](src/types/whiteboard.types.ts) with Element interface
- [ ] Define ToolType union types
- [ ] Create AppState interface structure
- [ ] Define Canvas transformation types (zoom, pan, viewBox)

---

## Phase 1: Core Canvas System

### 1.1 Canvas Rendering Foundation
- [ ] Create [src/components/Canvas/Canvas.tsx](src/components/Canvas/Canvas.tsx) with useRef hook
- [ ] Implement canvas resize handling (window resize listener)
- [ ] Set up rendering loop with requestAnimationFrame
- [ ] Create [src/lib/canvas-utils.ts](src/lib/canvas-utils.ts) for coordinate transformations
- [ ] Implement world-to-screen and screen-to-world coordinate conversion

### 1.2 Viewport Controls
- [ ] Implement pan functionality (spacebar + drag or middle mouse)
- [ ] Implement zoom with mouse wheel (zoom to cursor position)
- [ ] Add zoom limits (min: 0.1x, max: 10x)
- [ ] Create [src/components/Canvas/useViewport.ts](src/components/Canvas/useViewport.ts) hook
- [ ] Display zoom level indicator in UI

### 1.3 State Management Setup
- [ ] Create [src/stores/whiteboardStore.ts](src/stores/whiteboardStore.ts) with Zustand
- [ ] Implement canvas state (zoom, pan, viewBox)
- [ ] Implement elements array with add/update/delete actions
- [ ] Implement tool state (active tool, options)
- [ ] Implement selection state (selectedIds, handles)
- [ ] Set up history state structure (past, future arrays)

---

## Phase 2: Basic Element Rendering

### 2.1 Element Model & Utilities
- [ ] Implement base Element interface with id, type, position, dimensions, style
- [ ] Create [src/utils/element-factory.ts](src/utils/element-factory.ts) for creating new elements
- [ ] Implement element bounding box calculation in [src/utils/geometry.ts](src/utils/geometry.ts)
- [ ] Create element hit detection function (point-in-element test)
- [ ] Implement element serialization/deserialization

### 2.2 Shape Rendering
- [ ] Create [src/lib/renderer.ts](src/lib/renderer.ts) with render functions
- [ ] Implement renderRectangle with stroke and fill
- [ ] Implement renderEllipse with stroke and fill
- [ ] Implement renderLine with stroke
- [ ] Implement renderArrow (line with arrowhead)
- [ ] Add Rough.js integration for hand-drawn style (optional)

### 2.3 Rendering Pipeline
- [ ] Set up transform layer (apply zoom/pan to canvas context)
- [ ] Render all elements from state in order (z-index)
- [ ] Implement dirty rectangle optimization (only redraw changed regions)
- [ ] Add performance monitoring (FPS counter for development)

---

## Phase 3: Selection Tool

### 3.1 Basic Selection
- [ ] Create [src/tools/SelectTool.ts](src/tools/SelectTool.ts) module
- [ ] Implement single-click selection (find element at pointer position)
- [ ] Highlight selected elements with bounding box
- [ ] Clear selection on canvas click (outside elements)
- [ ] Implement multi-select with Shift+click

### 3.2 Transform Handles
- [x] Render 8 resize handles around selected element(s)
- [x] Implement rotation handle at top
- [x] Handle cursor changes on hover (resize cursors: nwse, nesw, ns, ew)
- [x] Calculate handle positions accounting for rotation

### 3.3 Move/Resize/Rotate
- [x] Implement drag to move selected elements
- [x] Implement resize from handles (maintain aspect ratio with Shift)
- [x] Implement rotation from rotation handle
- [x] Update element positions/dimensions in state
- [x] Add visual feedback during transformations

### 3.4 Drag Selection Box
- [x] Implement click-and-drag selection rectangle
- [x] Find all elements intersecting selection box
- [x] Add visual feedback (dashed blue rectangle)
- [x] Update selection state with found elements

---

## Phase 4: Drawing Tools

### 4.1 Rectangle Tool
- [ ] Create [src/tools/RectangleTool.ts](src/tools/RectangleTool.ts)
- [ ] Implement onPointerDown: start drawing at cursor
- [ ] Implement onPointerMove: update preview rectangle
- [ ] Implement onPointerUp: finalize and add to elements
- [ ] Handle drawing from center with Alt key
- [ ] Handle square constraint with Shift key

### 4.2 Ellipse Tool
- [ ] Create [src/tools/EllipseTool.ts](src/tools/EllipseTool.ts) (similar to Rectangle)
- [ ] Implement ellipse drawing logic
- [ ] Handle circle constraint with Shift key
- [ ] Add preview during drawing

### 4.3 Line & Arrow Tools
- [ ] Create [src/tools/LineTool.ts](src/tools/LineTool.ts)
- [ ] Implement two-point line drawing
- [ ] Create [src/tools/ArrowTool.ts](src/tools/ArrowTool.ts)
- [ ] Implement arrowhead rendering (calculate angle and points)
- [ ] Handle straight line constraint (0°, 45°, 90°) with Shift

### 4.4 Freedraw/Pen Tool
- [ ] Create [src/tools/PenTool.ts](src/tools/PenTool.ts)
- [ ] Integrate Perfect Freehand library
- [ ] Capture pointer movement and store points array
- [ ] Render smooth stroke path using Perfect Freehand
- [ ] Optimize: throttle point capture during drawing
- [ ] Add pressure sensitivity support (if available)

---

## Phase 5: Text Tool

### 5.1 Text Element
- [ ] Extend Element type to include text field and font properties
- [ ] Create [src/tools/TextTool.ts](src/tools/TextTool.ts)
- [ ] Implement click to create text element
- [ ] Render text on canvas using canvas.fillText

### 5.2 Text Editing
- [ ] Create [src/components/TextEditor/TextEditor.tsx](src/components/TextEditor/TextEditor.tsx) (DOM textarea overlay)
- [ ] Position textarea over canvas text element
- [ ] Handle text input and update element in real-time
- [ ] Finalize text on blur or Enter key
- [ ] Handle multi-line text with proper wrapping
- [ ] Support font size, family, alignment options

---

## Phase 6: Styling System

### 6.1 Style Properties
- [ ] Add stroke color picker to [src/components/Toolbar/ColorPicker.tsx](src/components/Toolbar/ColorPicker.tsx)
- [ ] Add fill color picker
- [ ] Add stroke width selector (1px, 2px, 4px, 8px presets)
- [ ] Add opacity slider (0-100%)
- [ ] Store current style in Zustand store

### 6.2 Apply Styles
- [ ] Apply current style to newly created elements
- [ ] Implement style change for selected elements
- [ ] Show current style of selected element in toolbar
- [ ] Handle multiple selection (show mixed if styles differ)

### 6.3 Style Presets
- [ ] Create preset system in [src/constants/style-presets.ts](src/constants/style-presets.ts)
- [ ] Add preset buttons to toolbar (default colors/widths)
- [ ] Implement quick style switching

---

## Phase 7: Undo/Redo System

### 7.1 History Management
- [ ] Create [src/stores/historyStore.ts](src/stores/historyStore.ts) with past/future arrays
- [ ] Implement captureState function (serialize current elements)
- [ ] Implement undo function (move to past, restore previous)
- [ ] Implement redo function (move to future, restore next)
- [ ] Limit history size (max 50 states)

### 7.2 Action Integration
- [ ] Wrap element mutations with history capture
- [ ] Implement keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
- [ ] Optimize: batch rapid changes (debounce captures during drag)
- [ ] Clear future stack on new action after undo

---

## Phase 8: Clipboard Operations

### 8.1 Copy/Paste
- [ ] Implement copy: serialize selected elements to clipboard
- [ ] Implement paste: deserialize and create new elements (offset position)
- [ ] Add keyboard shortcuts (Ctrl+C, Ctrl+V)
- [ ] Handle paste from external sources (JSON)

### 8.2 Cut/Delete
- [ ] Implement cut: copy then delete selected
- [ ] Implement delete: remove selected elements
- [ ] Add keyboard shortcuts (Ctrl+X, Delete, Backspace)
- [ ] Add to history

### 8.3 Duplicate
- [ ] Implement duplicate (Ctrl+D): create copy at slight offset
- [ ] Add to toolbar or context menu

---

## Phase 9: Z-Index Management

### 9.1 Layer Order
- [ ] Add z-index property to Element type
- [ ] Implement "Bring to Front" function (max z-index + 1)
- [ ] Implement "Send to Back" function (min z-index - 1)
- [ ] Implement "Bring Forward" function (swap with element above)
- [ ] Implement "Send Backward" function (swap with element below)

### 9.2 UI Integration
- [ ] Add layer order buttons to toolbar
- [ ] Add keyboard shortcuts (Ctrl+], Ctrl+[, etc.)
- [ ] Sort elements by z-index before rendering

---

## Phase 10: UI/UX Polish

### 10.1 Toolbar Component
- [ ] Create [src/components/Toolbar/Toolbar.tsx](src/components/Toolbar/Toolbar.tsx)
- [ ] Design with Tailwind: fixed top bar, tool buttons, style controls
- [ ] Implement tool selection buttons (icons for each tool)
- [ ] Add active state styling
- [ ] Make toolbar responsive (collapse on mobile)

### 10.2 Keyboard Shortcuts
- [ ] Create [src/hooks/useKeyboardShortcuts.ts](src/hooks/useKeyboardShortcuts.ts)
- [ ] Implement tool switching (V=select, R=rectangle, O=ellipse, L=line, P=pen, T=text)
- [ ] Implement Escape to cancel current tool/selection
- [ ] Add Shift/Alt/Ctrl modifier support
- [ ] Display shortcuts in UI (tooltip or help panel)

### 10.3 Visual Feedback
- [ ] Add hover states for elements (subtle highlight)
- [ ] Show cursor preview for drawing tools (crosshair)
- [ ] Add loading states for async operations
- [ ] Implement toast notifications for actions
- [ ] Add smooth transitions (Framer Motion or CSS)

---

## Phase 11: Persistence & Export

### 11.1 Local Storage
- [ ] Create [src/lib/storage.ts](src/lib/storage.ts) with localStorage wrapper
- [ ] Implement auto-save (debounced, every 2 seconds after changes)
- [ ] Implement load from localStorage on app mount
- [ ] Handle storage quota errors gracefully
- [ ] Add manual save button

### 11.2 JSON Export/Import
- [ ] Implement export to JSON (serialize entire state)
- [ ] Implement import from JSON (validate and load)
- [ ] Add download JSON button
- [ ] Add upload JSON button (file input)
- [ ] Handle version compatibility

### 11.3 Image Export
- [ ] Create [src/lib/export.ts](src/lib/export.ts)
- [ ] Implement PNG export (render to offscreen canvas, toBlob)
- [ ] Implement SVG export (convert elements to SVG elements)
- [ ] Add export button to toolbar
- [ ] Support exporting selection only or entire canvas
- [ ] Handle high-DPI exports (2x, 3x)

---

## Phase 12: Real-Time Collaboration

### 12.1 Liveblocks Setup
- [ ] Create [src/lib/liveblocks.ts](src/lib/liveblocks.ts) with createClient
- [ ] Obtain Liveblocks API key and configure
- [ ] Wrap App in RoomProvider in [src/App.tsx](src/App.tsx)
- [ ] Create room connection logic (unique room IDs)

### 12.2 Yjs Integration
- [ ] Create [src/stores/collaborationStore.ts](src/stores/collaborationStore.ts)
- [ ] Initialize Yjs document (Y.Doc)
- [ ] Create Y.Array for elements
- [ ] Sync Zustand elements array with Y.Array bidirectionally
- [ ] Handle remote changes (observe Y.Array, update local state)
- [ ] Handle local changes (update Y.Array when state changes)

### 12.3 Presence - Remote Cursors
- [ ] Create [src/components/Cursors/RemoteCursors.tsx](src/components/Cursors/RemoteCursors.tsx)
- [ ] Use Liveblocks useOthers hook for presence
- [ ] Broadcast local cursor position on pointer move (throttled)
- [ ] Render remote cursors with user names/colors
- [ ] Add smooth cursor interpolation

### 12.4 Presence - User Avatars
- [ ] Create [src/components/Presence/UserAvatars.tsx](src/components/Presence/UserAvatars.tsx)
- [ ] Display active users in top-right corner
- [ ] Show user count and avatar stack
- [ ] Add user color assignment

### 12.5 Conflict Resolution
- [ ] Test concurrent edits (two users editing same element)
- [ ] Verify Yjs CRDT handles conflicts automatically
- [ ] Add optimistic UI updates
- [ ] Handle network disconnections gracefully (show offline indicator)

### 12.6 Selection Sharing
- [ ] Broadcast selected element IDs via Liveblocks presence
- [ ] Show other users' selections with colored overlays
- [ ] Display "User X is editing" tooltip

---

## Phase 13: Advanced Features (Post-MVP)

### 13.1 Grid & Guides
- [ ] Add grid rendering option (toggleable)
- [ ] Implement snap-to-grid (configurable spacing)
- [ ] Add smart guides (alignment with other elements)

### 13.2 Grouping
- [ ] Implement group/ungroup functionality
- [ ] Treat groups as single element for selection/transformation
- [ ] Maintain individual element properties within group

### 13.3 Alignment Tools
- [ ] Add align left/center/right/top/middle/bottom
- [ ] Add distribute horizontally/vertically
- [ ] Add align to canvas center

### 13.4 Shape Libraries
- [ ] Create library panel component
- [ ] Add common shapes (arrows, flowchart symbols, icons)
- [ ] Implement drag-and-drop from library to canvas

### 13.5 Image Support
- [ ] Add image element type
- [ ] Implement image upload (drag-and-drop or file input)
- [ ] Render images on canvas
- [ ] Handle image scaling and cropping

### 13.6 Themes
- [ ] Implement dark/light theme toggle
- [ ] Update canvas background and UI colors
- [ ] Persist theme preference

### 13.7 Presentation Mode
- [ ] Add laser pointer tool (temporary drawing)
- [ ] Implement full-screen mode
- [ ] Add drawing focus/spotlight

---

## Phase 14: Testing & Optimization

### 14.1 Unit Tests
- [ ] Test geometry utilities (bounds, hit detection, transformations)
- [ ] Test element factory functions
- [ ] Test serialization/deserialization
- [ ] Test history management logic

### 14.2 Integration Tests
- [ ] Test tool interactions (drawing, selecting, transforming)
- [ ] Test undo/redo with various actions
- [ ] Test clipboard operations
- [ ] Test collaboration sync

### 14.3 Performance Optimization
- [ ] Profile rendering performance with Chrome DevTools
- [ ] Implement viewport culling (don't render off-screen elements)
- [ ] Optimize dirty rectangle rendering
- [ ] Add canvas layers (separate canvases for static/dynamic content)
- [ ] Implement element batching for Yjs updates
- [ ] Add debouncing/throttling where needed

### 14.4 Visual Regression Testing
- [ ] Set up screenshot comparison tests (Playwright or Chromatic)
- [ ] Test rendering accuracy for all element types
- [ ] Test selection handles rendering
- [ ] Test cursor rendering

---

## Phase 15: Deployment & Production

### 15.1 Build Optimization
- [ ] Configure Vite for production build
- [ ] Enable code splitting and lazy loading
- [ ] Optimize bundle size (analyze with rollup-plugin-visualizer)
- [ ] Add compression (gzip/brotli)

### 15.2 Backend Setup (Optional)
- [ ] Create Express/Next.js API for room management
- [ ] Add authentication (JWT, OAuth)
- [ ] Implement whiteboard CRUD (save/load from database)
- [ ] Set up PostgreSQL/MongoDB for persistence

### 15.3 Deployment
- [ ] Deploy to Vercel/Netlify (frontend)
- [ ] Deploy backend to Railway/Render (if applicable)
- [ ] Configure environment variables
- [ ] Set up CI/CD pipeline (GitHub Actions)

### 15.4 Monitoring
- [ ] Add error tracking (Sentry)
- [ ] Add analytics (Plausible or Fathom)
- [ ] Monitor performance metrics
- [ ] Set up uptime monitoring

---

## Success Metrics

### Performance Targets
- ✓ 60fps rendering with 100+ elements
- ✓ < 100ms latency for collaboration sync
- ✓ < 2s initial load time
- ✓ < 500KB initial bundle size

### User Experience Targets
- ✓ No tutorial needed for basic usage
- ✓ All core actions accessible via keyboard
- ✓ Zero data loss (auto-save + local persistence)
- ✓ Responsive feedback < 100ms for all interactions

---

## Tech Stack Summary

| Category | Technology | Purpose |
|----------|-----------|---------|
| Framework | React 18 + TypeScript | Component architecture |
| Build Tool | Vite | Fast development and bundling |
| Styling | Tailwind CSS | Utility-first UI styling |
| Canvas | HTML5 Canvas API / Fabric.js | Rendering engine |
| State | Zustand | Global state management |
| Collaboration | Liveblocks + Yjs | Real-time sync with CRDTs |
| Drawing | Perfect Freehand | Smooth pen strokes |
| Aesthetic | Rough.js (optional) | Hand-drawn look |
| Storage | localStorage | Client-side persistence |
| Testing | Vitest + Playwright | Unit and E2E tests |

---

## File Structure

```
whiteboard/
├── src/
│ ├── components/
│ │ ├── Canvas/
│ │ │ ├── Canvas.tsx
│ │ │ ├── useViewport.ts
│ │ │ ├── useCanvasDrawing.ts
│ │ │ └── useYjsBinding.ts
│ │ ├── Toolbar/
│ │ │ ├── Toolbar.tsx
│ │ │ ├── ColorPicker.tsx
│ │ │ └── ToolButton.tsx
│ │ ├── Cursors/
│ │ │ └── RemoteCursors.tsx
│ │ ├── Presence/
│ │ │ └── UserAvatars.tsx
│ │ └── TextEditor/
│ │ └── TextEditor.tsx
│ ├── tools/
│ │ ├── SelectTool.ts
│ │ ├── RectangleTool.ts
│ │ ├── EllipseTool.ts
│ │ ├── LineTool.ts
│ │ ├── ArrowTool.ts
│ │ ├── PenTool.ts
│ │ └── TextTool.ts
│ ├── stores/
│ │ ├── whiteboardStore.ts
│ │ ├── historyStore.ts
│ │ └── collaborationStore.ts
│ ├── lib/
│ │ ├── liveblocks.ts
│ │ ├── canvas-utils.ts
│ │ ├── renderer.ts
│ │ ├── storage.ts
│ │ └── export.ts
│ ├── utils/
│ │ ├── element-factory.ts
│ │ ├── geometry.ts
│ │ └── transforms.ts
│ ├── types/
│ │ └── whiteboard.types.ts
│ ├── constants/
│ │ └── style-presets.ts
│ ├── hooks/
│ │ └── useKeyboardShortcuts.ts
│ ├── App.tsx
│ └── main.tsx
├── public/
├── tests/
│ ├── unit/
│ └── e2e/
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## Getting Started

1. Clone repository
2. Run `npm install`
3. Run `npm run dev`
4. Open browser to `http://localhost:5173`
5. Start with Phase 0 and work sequentially

---

## Notes

- **Prioritize Performance**: Measure and optimize rendering continuously
- **User Testing**: Get feedback early and often
- **Incremental Development**: Each phase should be functional before moving to next
- **Documentation**: Keep README updated with features and usage
- **Version Control**: Commit frequently with clear messages

---

# Shape Rendering Logic (Abstract)

## 🎯 Core Concept

**Rendering = Transforming abstract data into visible pixels**

A shape is just **data** (position, size, color). Rendering **draws** that data onto the canvas.

---

## 📦 What is a Shape? (Data Model)

Every shape is an **object** with properties:

### Universal Properties (All Shapes)
- **Identity**: Unique ID
- **Type**: Rectangle, circle, line, arrow, text, freehand
- **Position**: X, Y coordinates (in world space)
- **Dimensions**: Width, height (or radius for circles)
- **Rotation**: Angle in degrees/radians
- **Layer**: Z-index (which shape is on top)
- **Style**: Stroke color, fill color, thickness, opacity
- **State**: Selected, hovered, locked

### Type-Specific Properties
- **Line/Arrow**: Start point, end point, control points
- **Text**: Font, size, alignment, actual text content
- **Freehand**: Array of points that form the path
- **Polygon**: Array of vertices

---

## 🔄 The Rendering Pipeline

### Step 1: **Preparation**
- Get the canvas and context
- Clear previous frame
- Set up coordinate system (DPR, zoom, pan)
- Apply background color/grid

### Step 2: **Sort Shapes**
- Order shapes by Z-index (layer order)
- Bottom shapes drawn first
- Top shapes drawn last (appear "in front")

### Step 3: **Transform Context**
- Apply DPR scaling (for sharp pixels)
- Apply zoom (user zoomed in/out)
- Apply pan (user moved the canvas)
- Now all drawing coordinates are in "world space"

### Step 4: **For Each Shape**
1. **Culling Check**: Is shape visible in viewport?
   - If completely outside view, skip it (optimization)
   - If inside or partially visible, render it

2. **Save Context State**
   - Remember current transform/style settings
   - Allows per-shape modifications

3. **Apply Shape Transform**
   - Translate to shape's position
   - Rotate around shape's center
   - Scale if needed

4. **Draw Shape Geometry**
   - Rectangle: Draw 4 corners, connect them
   - Circle: Draw circular arc
   - Line: Draw from point A to point B
   - Freehand: Draw path through all points
   - Text: Render text at position

5. **Apply Shape Style**
   - Set stroke color/width
   - Set fill color
   - Apply opacity/blend modes
   - Add shadows if configured

6. **Restore Context State**
   - Undo shape-specific transforms
   - Ready for next shape

### Step 5: **Overlays & Decorations**
- **Selection indicators**: Blue boxes around selected shapes
- **Resize handles**: Little squares on corners
- **Rotation handle**: Circle above shape
- **Hover effects**: Highlight when mouse over
- **Snap guides**: Visual lines showing alignment

### Step 6: **Tool Preview**
- If user is drawing, show work-in-progress
- Example: Rectangle being dragged out
- Example: Arrow being positioned
- Uses temporary/translucent rendering

### Step 7: **Finalize**
- Flush any pending operations
- Schedule next frame (for animations/continuous rendering)

---

## 🎨 Two Rendering Styles

### **Clean/Geometric** (Default)
- Perfect mathematical shapes
- Uses canvas primitives directly
- `ctx.rect()`, `ctx.arc()`, `ctx.lineTo()`
- Fast, precise, professional look

### **Sketchy/Hand-drawn** (Rough.js style)
- Shapes with intentional imperfections
- Lines wobble slightly
- Fill patterns (hatching, cross-hatch)
- Casual, approachable aesthetic
- Slower (more complex paths)

**Choice determines which drawing functions to call**

---

## 🧮 Coordinate Systems (Critical!)

### **Screen Coordinates** (Pixels on display)
- Where your mouse cursor is
- Example: `(500, 300)` = 500px from left, 300px from top

### **World Coordinates** (Shape positions)
- Independent of zoom/pan
- Shapes stored in this system
- Example: Rectangle at `(100, 100)` stays there even when you zoom

### **Transformations Between Systems**
```
Screen → World:
  worldX = (screenX - panX) / zoom
  worldY = (screenY - panY) / zoom

World → Screen:
  screenX = worldX * zoom + panX
  screenY = worldY * zoom + panY
```

**Canvas transform handles this automatically once set up!**

---

## 🎭 Rendering Modes

### **Normal Render** (Every Frame)
- Draw all visible shapes
- Apply current styles
- Show selections if any
- Smooth animations

### **Draft Mode** (While Interacting)
- Lower quality for speed
- Skip shadows, gradients
- Reduce anti-aliasing
- Triggered during pan/zoom/drag

### **Export Mode** (Save/Screenshot)
- Highest quality settings
- No UI overlays (selection boxes)
- Specific DPR override
- Clean output for sharing

---

## 🔧 Optimization Strategies

### **Dirty Rectangle**
- Only redraw changed areas
- Track which shapes moved/changed
- Skip redrawing static regions
- Huge performance boost for large canvases

### **Viewport Culling**
- Don't render shapes outside view
- Check bounding box intersection
- Skip processing invisible shapes
- Critical for 1000+ shape boards

### **Level of Detail (LOD)**
- Simplified rendering when zoomed out
- Detailed rendering when zoomed in
- Example: Text → gray box when small

### **Batching**
- Group similar shapes
- One stroke style for multiple rectangles
- Reduces context state changes

### **Caching**
- Pre-render complex shapes to offscreen canvas
- Reuse cached version when unchanged
- Expensive: gradients, patterns, effects

---

## 🎯 Selection & Interaction Rendering

### **Selection State**
- Shapes know if they're selected
- Render selection box around them
- Show resize handles (8 small squares)
- Show rotation handle (circle above)

### **Hover State**
- Shape under mouse highlighted
- Different cursor shown
- Subtle color change or outline
- Immediate visual feedback

### **Multi-Selection**
- Calculate bounding box of all selected
- Show single selection box around group
- Handles resize entire group
- Rotation rotates around group center

---

## 🖼️ Rendering Order Matters

### **Drawing Sequence:**
1. Background (canvas color)
2. Grid (if enabled)
3. Shapes (sorted by Z-index, bottom to top)
4. Selection boxes
5. Resize/rotation handles
6. Tool preview (current drawing action)
7. Cursor decorations
8. Debug overlays (optional)

**Later items draw on top of earlier items**

---

## 🔄 Continuous vs. Event-Driven Rendering

### **Continuous** (requestAnimationFrame loop)
- Render every frame (~60 FPS)
- Smooth animations
- Higher battery usage
- Good for: Active drawing, panning, animating

### **Event-Driven** (render on change only)
- Render only when something changes
- Lower CPU/battery usage
- Good for: Static diagrams, reading mode
- Re-render triggers: Mouse move, shape added, zoom change

**Hybrid approach**: Continuous during interaction, idle when static

---

## 📐 Hit Detection (Which Shape Clicked?)

### **Process:**
1. User clicks at screen coordinates
2. Convert to world coordinates
3. Check each shape (top to bottom)
4. Does click point fall inside shape bounds?
5. First match = selected shape

### **Methods:**
- **Bounding box**: Quick rectangular check
- **Precise**: Check actual shape path (slower)
- **Point-in-polygon**: For complex shapes
- **Distance-based**: For lines/arrows (click near line)

**Order matters**: Check top shapes first (they're "in front")

---

## 🎨 Style Application

### **Global Styles** (Apply to context)
- Stroke color, width
- Fill color
- Line caps (round, square, butt)
- Line joins (round, bevel, miter)
- Shadow blur/offset/color
- Opacity (globalAlpha)

### **Per-Shape Overrides**
- Each shape can override global styles
- Applied before drawing that shape
- Restored after drawing

### **Style Inheritance**
- Selected shapes: Slightly different color
- Locked shapes: Reduced opacity
- Grouped shapes: Visual grouping indicator

---

## 🧩 The Renderer Interface (Abstract)

Think of the renderer as a function:

**Input:**
- Canvas context (where to draw)
- Shape data (what to draw)
- Style preferences (how to draw)
- Viewport state (zoom, pan, DPR)

**Process:**
- Transform coordinates
- Apply styles
- Draw geometry
- Add decorations

**Output:**
- Pixels on canvas
- Nothing returned (side effect: drawing)

---

## 🎯 Key Design Decisions

### **Renderer Should Be:**
- **Stateless**: Doesn't store shape data
- **Pure**: Same input → same output
- **Fast**: Optimized for many shapes
- **Flexible**: Easy to add new shape types
- **Modular**: Each shape type has own renderer

### **Renderer Should NOT:**
- Modify shape data (read-only)
- Handle user input (that's the tool's job)
- Manage state (that's the store's job)
- Do business logic (just draw!)

---

## 📊 Mental Model

```
Shape Data (in Store)
    ↓
Rendering Pipeline
    ↓
Canvas Pixels (on Screen)
    ↓
User sees drawing
```

**One-way flow**: Data → Rendering → Display

Changes to data trigger re-render. Re-render reads latest data.

---

## 🎯 Summary

**Rendering is:**
1. Take shape **data**
2. Apply **transformations** (position, rotation, zoom)
3. Draw **geometry** (rectangles, circles, paths)
4. Apply **styles** (colors, strokes, fills)
5. Add **decorations** (selections, handles)
6. Optimize for **performance** (culling, caching)
7. Handle **multiple coordinate systems** (screen ↔ world)

**Goal**: Fast, smooth, accurate visual representation of abstract shape data.