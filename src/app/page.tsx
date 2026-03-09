'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Box, Sphere, Torus, Cone, Cylinder, Dodecahedron, Tetrahedron, Grid, Stars, Sparkles } from '@react-three/drei'
import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'

function Shape({ 
  type, 
  position, 
  color, 
  wireframe, 
  size, 
  metalness, 
  roughness, 
  isSelected,
  deformationType,
  deformationStrength,
  effectType,
  effectIntensity,
  onClick,
  onPositionChange,
  animationEnabled,
  colorShiftEnabled,
  noiseIntensity,
  glowIntensity,
  rotation,
  scale,
  materialType,
  textureType,
  normalMapEnabled,
  roughnessMapEnabled,
  metalnessMapEnabled,
  displacementMapEnabled,
  emissiveMapEnabled,
  animationSpeed
}: { 
  type: string; 
  position: [number, number, number]; 
  color: string; 
  wireframe: boolean;
  size: number;
  metalness: number;
  roughness: number;
  isSelected: boolean;
  deformationType: string;
  deformationStrength: number;
  effectType: string;
  effectIntensity: number;
  onClick: () => void;
  onPositionChange: (newPosition: [number, number, number]) => void;
  animationEnabled: boolean;
  colorShiftEnabled: boolean;
  noiseIntensity: number;
  glowIntensity: number;
  rotation: [number, number, number];
  scale: [number, number, number];
  materialType: string;
  textureType: string;
  normalMapEnabled: boolean;
  roughnessMapEnabled: boolean;
  metalnessMapEnabled: boolean;
  displacementMapEnabled: boolean;
  emissiveMapEnabled: boolean;
  animationSpeed: number;
}) {
  const meshRef = useRef<any>(null)
  const [hovered, setHovered] = useState(false)
  
  // Animation - only if animationEnabled is true
  useFrame((state) => {
    if (meshRef.current && animationEnabled) {
      const speed = animationSpeed || 1
      meshRef.current.rotation.x += 0.01 * speed
      meshRef.current.rotation.y += 0.01 * speed
    }
  })
  
  // Apply deformation based on type
  const getDeformedArgs = () => {
    const baseArgs = size === 1 ? [1, 1, 1] : [size, size, size]
    
    if (deformationType === 'twist' && deformationStrength > 0) {
      return baseArgs.map(arg => arg * (1 + deformationStrength * 0.3))
    } else if (deformationType === 'scale' && deformationStrength > 0) {
      const scale = 1 + deformationStrength * 0.5
      return baseArgs.map(arg => arg * scale)
    } else if (deformationType === 'squeeze' && deformationStrength > 0) {
      return [baseArgs[0] * (1 - deformationStrength * 0.3), baseArgs[1], baseArgs[2] * (1 + deformationStrength * 0.3)]
    } else if (deformationType === 'wave' && deformationStrength > 0) {
      return [baseArgs[0], baseArgs[1] * (1 + Math.sin(Date.now() * 0.001) * deformationStrength * 0.2), baseArgs[2]]
    } else if (deformationType === 'spike' && deformationStrength > 0) {
      return [baseArgs[0] * (1 + deformationStrength * 0.5), baseArgs[1], baseArgs[2] * (1 + deformationStrength * 0.5)]
    }
    
    return baseArgs
  }
  
  // Get material based on type
  const getMaterial = () => {
    let baseColor = color
    if (colorShiftEnabled) {
      const hue = (Date.now() * 0.001 * (animationSpeed || 1)) % 1
      baseColor = `hsl(${hue * 360}, 70%, 50%)`
    }
    
    const materialProps: any = {
      color: baseColor,
      wireframe,
      metalness,
      roughness,
      emissive: isSelected ? baseColor : '#000000',
      emissiveIntensity: isSelected ? 0.2 : 0
    }
    
    // Apply effects
    if (effectType === 'glow' && effectIntensity > 0) {
      materialProps.emissive = baseColor
      materialProps.emissiveIntensity = effectIntensity * 0.8
    } else if (effectType === 'transparent' && effectIntensity > 0) {
      materialProps.opacity = 1 - effectIntensity * 0.7
      materialProps.transparent = true
    } else if (effectType === 'metallic' && effectIntensity > 0) {
      materialProps.metalness = Math.min(1, metalness + effectIntensity * 0.5)
    } else if (effectType === 'hologram' && effectIntensity > 0) {
      materialProps.opacity = 0.7 + Math.sin(Date.now() * 0.005) * 0.3
      materialProps.transparent = true
      materialProps.emissive = baseColor
      materialProps.emissiveIntensity = effectIntensity * 0.5
    } else if (effectType === 'plasma' && effectIntensity > 0) {
      const plasmaColor = `hsl(${(Date.now() * 0.002) % 360}, 100%, 50%)`
      materialProps.emissive = plasmaColor
      materialProps.emissiveIntensity = effectIntensity * 0.6
      materialProps.color = plasmaColor
    }
    
    // Material type selection
    switch (materialType) {
      case 'basic':
        return <meshBasicMaterial {...materialProps} />
      case 'phong':
        return <meshPhongMaterial {...materialProps} shininess={100} />
      case 'lambert':
        return <meshLambertMaterial {...materialProps} />
      case 'physical':
        return <meshPhysicalMaterial 
          {...materialProps} 
          clearcoat={0.5}
          clearcoatRoughness={0.1}
        />
      case 'toon':
        return <meshToonMaterial {...materialProps} />
      case 'depth':
        return <meshDepthMaterial {...materialProps} />
      case 'normal':
        return <meshNormalMaterial {...materialProps} />
      case 'standard':
      default:
        return <meshStandardMaterial {...materialProps} />
    }
  }
  
  const handleClick = (event: any) => {
    event.stopPropagation()
    onClick()
  }
  
  const handlePointerDown = (event: any) => {
    event.stopPropagation()
    onClick()
  }
  
  const handlePointerOver = () => setHovered(true)
  const handlePointerOut = () => setHovered(false)
  
  const args = getDeformedArgs()
  const material = getMaterial()
  
  // Selection outline
  const selectionOutline = isSelected ? (
    <lineSegments>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          count={24}
          array={new Float32Array([
            -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1,
            -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,
            -1, -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1,
            1, -1, -1, 1, -1, 1, 1, 1, 1, 1, 1, -1,
            -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1,
            -1, 1, -1, 1, 1, -1, 1, 1, 1, -1, 1, 1
          ])}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial attach="material" color="#000000" linewidth={2} />
    </lineSegments>
  ) : null
  
  switch (type) {
    case 'box':
      return (
        <Box 
          ref={meshRef}
          position={position} 
          args={args as [number, number, number]}
          rotation={rotation}
          scale={scale}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          {material}
          {selectionOutline}
        </Box>
      )
    case 'sphere':
      return (
        <Sphere 
          ref={meshRef}
          position={position} 
          args={[args[0] * 0.7, 32, 32]}
          rotation={rotation}
          scale={scale}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          {material}
          {selectionOutline}
        </Sphere>
      )
    case 'torus':
      return (
        <Torus 
          ref={meshRef}
          position={position} 
          args={[args[0] * 0.7, args[1] * 0.3, 16, 100]}
          rotation={rotation}
          scale={scale}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          {material}
          {selectionOutline}
        </Torus>
      )
    case 'cone':
      return (
        <Cone 
          ref={meshRef}
          position={position} 
          args={[args[0] * 0.7, args[1] * 1.4, 32]}
          rotation={rotation}
          scale={scale}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          {material}
          {selectionOutline}
        </Cone>
      )
    case 'cylinder':
      return (
        <Cylinder 
          ref={meshRef}
          position={position} 
          args={[args[0] * 0.7, args[1] * 0.7, args[2] * 1.4, 32]}
          rotation={rotation}
          scale={scale}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          {material}
          {selectionOutline}
        </Cylinder>
      )
    case 'dodecahedron':
      return (
        <Dodecahedron 
          ref={meshRef}
          position={position} 
          args={[args[0] * 0.7]}
          rotation={rotation}
          scale={scale}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          {material}
          {selectionOutline}
        </Dodecahedron>
      )
    case 'tetrahedron':
      return (
        <Tetrahedron 
          ref={meshRef}
          position={position} 
          args={[args[0] * 0.7]}
          rotation={rotation}
          scale={scale}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          {material}
          {selectionOutline}
        </Tetrahedron>
      )
    default:
      return null
  }
}

export default function Home() {
  const [shapes, setShapes] = useState([])
  const [selectedMenu, setSelectedMenu] = useState('components')
  const [wireframe, setWireframe] = useState(false)
  const [currentColor, setCurrentColor] = useState('#ff0000')
  const [currentShapeType, setCurrentShapeType] = useState('box')
  const [autoRotate, setAutoRotate] = useState(true)
  const [gridVisible, setGridVisible] = useState(true)
  const [axesVisible, setAxesVisible] = useState(true)
  const [lightIntensity, setLightIntensity] = useState(1)
  const [cameraPosition, setCameraPosition] = useState([0, 0, 5])
  const [shapeSize, setShapeSize] = useState(1)
  const [metalness, setMetalness] = useState(0)
  const [roughness, setRoughness] = useState(1)
  const [selectedShapeId, setSelectedShapeId] = useState<number | null>(null)
  const [deformationType, setDeformationType] = useState('none')
  const [deformationStrength, setDeformationStrength] = useState(0)
  const [effectType, setEffectType] = useState('none')
  const [effectIntensity, setEffectIntensity] = useState(0)
  
  // Animation Settings
  const [animationEnabled, setAnimationEnabled] = useState(false)
  const [animationSpeed, setAnimationSpeed] = useState(1)
  const [colorShiftEnabled, setColorShiftEnabled] = useState(false)
  const [rotationEnabled, setRotationEnabled] = useState(false)
  const [pulseEnabled, setPulseEnabled] = useState(false)
  
  // Advanced Effects
  const [particlesEnabled, setParticlesEnabled] = useState(false)
  const [starsEnabled, setStarsEnabled] = useState(true)
  const [sparklesEnabled, setSparklesEnabled] = useState(false)
  const [glowIntensity, setGlowIntensity] = useState(0)
  const [shadowType, setShadowType] = useState('none')
  const [reflectionEnabled, setReflectionEnabled] = useState(false)
  const [noiseIntensity, setNoiseIntensity] = useState(0)
  
  // Materials & Textures
  const [materialType, setMaterialType] = useState('standard')
  const [textureType, setTextureType] = useState('none')
  const [normalMapEnabled, setNormalMapEnabled] = useState(false)
  const [roughnessMapEnabled, setRoughnessMapEnabled] = useState(false)
  const [metalnessMapEnabled, setMetalnessMapEnabled] = useState(false)
  const [displacementMapEnabled, setDisplacementMapEnabled] = useState(false)
  const [emissiveMapEnabled, setEmissiveMapEnabled] = useState(false)
  
  // Advanced Settings
  const [renderQuality, setRenderQuality] = useState('high')
  const [antiAliasing, setAntiAliasing] = useState('4x')
  const [shadowQuality, setShadowQuality] = useState('medium')
  const [postProcessing, setPostProcessing] = useState(false)
  const [ambientOcclusion, setAmbientOcclusion] = useState(false)
  const [bloomEnabled, setBloomEnabled] = useState(false)
  const [vignetteEnabled, setVignetteEnabled] = useState(false)
  
  // Drag & Drop
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragMode, setDragMode] = useState<'move' | 'rotate' | 'scale'>('move')
  
  // Color Picker State
  const [colorMode, setColorMode] = useState<'solid' | 'gradient'>('solid')
  const [gradientColors, setGradientColors] = useState(['#ff0000', '#0000ff'])
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear')
  const [hexInput, setHexInput] = useState('#ff0000')
  const [showColorPicker, setShowColorPicker] = useState(false)

  const sidebarItems = [
    { id: 'directory', label: 'ROOT_DIRECTORY', icon: '[01]' },
    { id: 'manifest', label: 'ASSET_MANIFEST', icon: '[02]' },
    { id: 'components', label: 'COMPONENT_LIB', icon: '[03]' },
    { id: 'render', label: 'RENDER_QUEUE', icon: '[04]' },
    { id: 'system', label: 'SYSTEM_CONFIG', icon: '[05]' }
  ]

  const actionItems = [
    { label: 'VARY_STRONG' },
    { label: 'VARY_SUBTLE' },
    { label: 'CHANGE_STYLE' },
    { label: 'REMIX_COLORS' },
    { label: 'SHUFFLE_LAYOUT' }
  ]

  const shapeTypes = ['box', 'sphere', 'torus', 'cone', 'cylinder', 'dodecahedron', 'tetrahedron']
  const presetColors = ['#ff0000', '#ffffff', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']

  // Color Picker Functions
  const handleHexInput = (hex: string) => {
    const validHex = /^#?[0-9A-Fa-f]{6}$/.test(hex)
    if (validHex) {
      const cleanHex = hex.startsWith('#') ? hex : `#${hex}`
      setHexInput(cleanHex)
      setCurrentColor(cleanHex)
      if (colorMode === 'gradient') {
        const newGradient = [...gradientColors]
        newGradient[0] = cleanHex
        setGradientColors(newGradient)
      }
    }
  }

  const handleColorPickerChange = (color: string) => {
    setCurrentColor(color)
    setHexInput(color)
    if (colorMode === 'gradient') {
      const newGradient = [...gradientColors]
      newGradient[0] = color
      setGradientColors(newGradient)
    }
  }

  const addGradientColor = () => {
    if (gradientColors.length < 5) {
      setGradientColors([...gradientColors, '#ffffff'])
    }
  }

  const removeGradientColor = (index: number) => {
    if (gradientColors.length > 2) {
      setGradientColors(gradientColors.filter((_, i) => i !== index))
    }
  }

  const updateGradientColor = (index: number, color: string) => {
    const newGradient = [...gradientColors]
    newGradient[index] = color
    setGradientColors(newGradient)
  }

  const getGradientCSS = () => {
    if (colorMode === 'gradient' && gradientColors.length > 1) {
      const colors = gradientColors.join(', ')
      if (gradientType === 'linear') {
        return `linear-gradient(45deg, ${colors})`
      } else {
        return `radial-gradient(circle, ${colors})`
      }
    }
    return currentColor
  }

  const addShape = (type: string) => {
    const newShape = {
      id: Date.now(),
      type,
      position: [0, 0, 0] as [number, number, number],
      color: colorMode === 'gradient' ? getGradientCSS() : currentColor,
      wireframe,
      size: shapeSize,
      metalness,
      roughness,
      deformationType,
      deformationStrength,
      effectType,
      effectIntensity,
      materialType,
      textureType,
      normalMapEnabled,
      roughnessMapEnabled,
      metalnessMapEnabled,
      displacementMapEnabled,
      emissiveMapEnabled,
      animationEnabled: false,
      rotation: [0, 0, 0] as [number, number, number],
      scale: [1, 1, 1] as [number, number, number],
      colorMode,
      gradientColors: [...gradientColors],
      gradientType
    }
    setShapes([...shapes, newShape])
  }

  const selectShape = (shapeId: number) => {
    setSelectedShapeId(shapeId === selectedShapeId ? null : shapeId)
  }

  const updateSelectedShape = (updates: any) => {
    if (selectedShapeId !== null) {
      setShapes(shapes.map(shape => 
        shape.id === selectedShapeId ? { ...shape, ...updates } : shape
      ))
    }
  }

  const deleteSelectedShape = () => {
    if (selectedShapeId !== null) {
      setShapes(shapes.filter(shape => shape.id !== selectedShapeId))
      setSelectedShapeId(null)
    }
  }

  const moveSelectedShape = (axis: 'x' | 'y' | 'z', delta: number) => {
    if (selectedShapeId !== null) {
      const shape = shapes.find(s => s.id === selectedShapeId)
      if (shape) {
        const newPosition = [...shape.position] as [number, number, number]
        if (axis === 'x') newPosition[0] += delta
        if (axis === 'y') newPosition[1] += delta
        if (axis === 'z') newPosition[2] += delta
        updateSelectedShape({ position: newPosition })
      }
    }
  }

  const rotateSelectedShape = (axis: 'x' | 'y' | 'z', delta: number) => {
    if (selectedShapeId !== null) {
      const shape = shapes.find(s => s.id === selectedShapeId)
      if (shape) {
        const newRotation = [...shape.rotation] as [number, number, number]
        if (axis === 'x') newRotation[0] += delta
        if (axis === 'y') newRotation[1] += delta
        if (axis === 'z') newRotation[2] += delta
        updateSelectedShape({ rotation: newRotation })
      }
    }
  }

  const scaleSelectedShape = (delta: number) => {
    if (selectedShapeId !== null) {
      const shape = shapes.find(s => s.id === selectedShapeId)
      if (shape) {
        const newScale = [...shape.scale] as [number, number, number]
        newScale[0] = Math.max(0.1, newScale[0] + delta)
        newScale[1] = Math.max(0.1, newScale[1] + delta)
        newScale[2] = Math.max(0.1, newScale[2] + delta)
        updateSelectedShape({ scale: newScale })
      }
    }
  }

  const clearShapes = () => {
    setShapes([])
  }

  const toggleWireframe = () => {
    setWireframe(!wireframe)
    setShapes(shapes.map(shape => ({ ...shape, wireframe: !wireframe })))
  }

  const updateAllShapes = (updates: any) => {
    setShapes(shapes.map(shape => ({ ...shape, ...updates })))
  }

  const randomizeAllColors = () => {
    const randomHex = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
    setShapes(shapes.map(shape => ({
      ...shape,
      color: shape.colorMode === 'gradient' 
        ? `linear-gradient(45deg, ${[randomHex(), randomHex(), randomHex()].join(', ')})`
        : randomHex()
    })))
  }

  const exportScene = () => {
    const sceneData = {
      shapes,
      settings: {
        wireframe,
        autoRotate,
        gridVisible,
        axesVisible,
        lightIntensity,
        cameraPosition,
        shapeSize,
        metalness,
        roughness
      }
    }
    console.log('Export Scene Data:', sceneData)
    alert('Scene data exported to console!')
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-white">
      {/* Grid Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full" style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, #000000 0px, transparent 1px, transparent 2px, #000000 3px),
            repeating-linear-gradient(90deg, #000000 0px, transparent 1px, transparent 2px, #000000 3px)
          `,
          backgroundSize: '20px 20px'
        }} />
      </div>
      
      {/* Left Sidebar */}
      <div className="absolute left-0 top-0 h-full w-80 bg-white border-r-4 border-black overflow-hidden z-20">
        <div className="h-full overflow-y-auto scrollbar-hide">
          <div className="p-6 pb-20">
            {/* Brand */}
            <div className="mb-8 border-b-4 border-black pb-4">
              <h1 className="text-5xl font-bold text-black mb-2 font-script tracking-wider">
                FORMA
              </h1>
              <div className="text-xs text-black/60 font-mono">SYS.REQ.009 // V.1.4.3</div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1 mb-8">
              {sidebarItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedMenu(item.id)}
                  className={`w-full p-4 border-2 transition-all font-mono text-sm cursor-pointer ${
                    selectedMenu === item.id
                      ? 'bg-black text-white border-black'
                      : 'border-gray-300 text-black hover:border-black'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="tracking-wider">{item.label}</span>
                    <span className="text-xs opacity-60">{item.icon}</span>
                  </div>
                </div>
              ))}
            </nav>

          {/* Shape Controls */}
          {selectedMenu === 'components' && (
            <div className="space-y-4">
              <div className="border-2 border-black p-4 bg-white">
                <h3 className="text-black font-mono text-sm mb-3">ADD SHAPE</h3>
                <div className="grid grid-cols-2 gap-2">
                  {shapeTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => addShape(type)}
                      className={`border-2 text-xs p-2 font-mono uppercase transition-all ${
                        currentShapeType === type ? 'bg-black text-white border-black' : 'border-gray-300 text-black hover:border-black'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-2 border-black p-4 bg-white">
                <h3 className="text-black font-mono text-sm mb-3">COLOR SELECTOR</h3>
                
                {/* Color Mode Toggle */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-black text-xs font-mono">MODE</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setColorMode('solid')}
                      className={`px-3 py-1 border-2 text-xs font-mono transition-all ${
                        colorMode === 'solid'
                          ? 'bg-black text-white border-black'
                          : 'border-gray-300 text-black hover:border-black'
                      }`}
                    >
                      SOLID
                    </button>
                    <button
                      onClick={() => setColorMode('gradient')}
                      className={`px-3 py-1 border-2 text-xs font-mono transition-all ${
                        colorMode === 'gradient'
                          ? 'bg-black text-white border-black'
                          : 'border-gray-300 text-black hover:border-black'
                      }`}
                    >
                      GRADIENT
                    </button>
                  </div>
                </div>

                {/* Color Picker with Hex Input */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={currentColor}
                      onChange={(e) => handleColorPickerChange(e.target.value)}
                      className="w-12 h-12 border-2 border-black cursor-pointer"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={hexInput}
                        onChange={(e) => handleHexInput(e.target.value)}
                        placeholder="#000000"
                        className="w-full px-3 py-2 border-2 border-gray-300 font-mono text-xs"
                        maxLength={7}
                      />
                      <div className="text-xs text-black/60 font-mono mt-1">
                        {colorMode === 'gradient' ? 'FIRST COLOR' : 'SOLID COLOR'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gradient Controls */}
                {colorMode === 'gradient' && (
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-black text-xs font-mono">GRADIENT TYPE</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setGradientType('linear')}
                          className={`px-2 py-1 border-2 text-xs font-mono transition-all ${
                            gradientType === 'linear'
                              ? 'bg-black text-white border-black'
                              : 'border-gray-300 text-black hover:border-black'
                          }`}
                        >
                          LINEAR
                        </button>
                        <button
                          onClick={() => setGradientType('radial')}
                          className={`px-2 py-1 border-2 text-xs font-mono transition-all ${
                            gradientType === 'radial'
                              ? 'bg-black text-white border-black'
                              : 'border-gray-300 text-black hover:border-black'
                          }`}
                        >
                          RADIAL
                        </button>
                      </div>
                    </div>

                    {/* Gradient Colors */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-black text-xs font-mono">GRADIENT COLORS</span>
                        <button
                          onClick={addGradientColor}
                          disabled={gradientColors.length >= 5}
                          className="px-2 py-1 border-2 border-black text-xs font-mono hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ADD +
                        </button>
                      </div>
                      {gradientColors.map((color, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={color}
                            onChange={(e) => updateGradientColor(index, e.target.value)}
                            className="w-8 h-8 border-2 border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={color}
                            onChange={(e) => {
                              const validHex = /^#?[0-9A-Fa-f]{6}$/.test(e.target.value)
                              if (validHex) {
                                const cleanHex = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`
                                updateGradientColor(index, cleanHex)
                              }
                            }}
                            className="flex-1 px-2 py-1 border-2 border-gray-300 font-mono text-xs"
                            maxLength={7}
                          />
                          {gradientColors.length > 2 && (
                            <button
                              onClick={() => removeGradientColor(index)}
                              className="px-2 py-1 border-2 border-red-600 text-xs font-mono hover:bg-red-600 hover:text-white"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Gradient Preview */}
                    <div className="border-2 border-black p-2">
                      <div 
                        className="w-full h-8 rounded"
                        style={{ background: getGradientCSS() }}
                      />
                    </div>
                  </div>
                )}

                {/* Preset Colors */}
                <div className="space-y-2">
                  <span className="text-black text-xs font-mono">PRESET COLORS</span>
                  <div className="grid grid-cols-7 gap-1">
                    {presetColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorPickerChange(color)}
                        className={`w-full h-8 border-2 transition-all ${
                          (colorMode === 'solid' && currentColor === color) || 
                          (colorMode === 'gradient' && gradientColors[0] === color)
                            ? 'border-black' 
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-2 border-black p-4 bg-white">
                <h3 className="text-black font-mono text-sm mb-3">MATERIAL PROPERTIES</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-black text-xs font-mono">SIZE: {shapeSize.toFixed(1)}</label>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={shapeSize}
                      onChange={(e) => setShapeSize(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-black text-xs font-mono">METALNESS: {metalness.toFixed(1)}</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={metalness}
                      onChange={(e) => setMetalness(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-black text-xs font-mono">ROUGHNESS: {roughness.toFixed(1)}</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={roughness}
                      onChange={(e) => setRoughness(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={toggleWireframe}
                  className={`w-full p-3 border-2 text-sm font-mono transition-all ${
                    wireframe 
                      ? 'bg-black text-white border-black' 
                      : 'border-gray-300 text-black hover:border-black'
                  }`}
                >
                  WIREFRAME: {wireframe ? 'ON' : 'OFF'}
                </button>
                
                <button
                  onClick={randomizeAllColors}
                  className="w-full p-3 border-2 border-gray-300 text-black text-sm font-mono hover:bg-black hover:text-white transition-all"
                >
                  RANDOMIZE COLORS
                </button>
                
                <button
                  onClick={clearShapes}
                  className="w-full p-3 border-2 border-gray-300 text-black text-sm font-mono hover:bg-black hover:text-white transition-all"
                >
                  CLEAR ALL
                </button>
              </div>
            </div>
          )}

          {/* Render Queue Controls */}
          {selectedMenu === 'render' && (
            <div className="space-y-4">
              <div className="border-2 border-black p-4 bg-white">
                <h3 className="text-black font-mono text-sm mb-3">ENVIRONMENTAL EFFECTS</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-black text-xs font-mono">STARS</span>
                    <button
                      onClick={() => setStarsEnabled(!starsEnabled)}
                      className={`px-3 py-1 border-2 text-xs font-mono transition-all ${
                        starsEnabled 
                          ? 'bg-black text-white border-black' 
                          : 'border-gray-300 text-black hover:border-black'
                      }`}
                    >
                      {starsEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-black text-xs font-mono">SPARKLES</span>
                    <button
                      onClick={() => setSparklesEnabled(!sparklesEnabled)}
                      className={`px-3 py-1 border-2 text-xs font-mono transition-all ${
                        sparklesEnabled 
                          ? 'bg-black text-white border-black' 
                          : 'border-gray-300 text-black hover:border-black'
                      }`}
                    >
                      {sparklesEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-black text-xs font-mono">GLOBAL COLOR SHIFT</span>
                    <button
                      onClick={() => setColorShiftEnabled(!colorShiftEnabled)}
                      className={`px-3 py-1 border-2 text-xs font-mono transition-all ${
                        colorShiftEnabled 
                          ? 'bg-black text-white border-black' 
                          : 'border-gray-300 text-black hover:border-black'
                      }`}
                    >
                      {colorShiftEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <div>
                    <label className="text-black text-xs font-mono">ANIMATION SPEED: {animationSpeed.toFixed(1)}</label>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="0.1"
                      value={animationSpeed}
                      onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="border-2 border-black p-4 bg-white">
                <h3 className="text-black font-mono text-sm mb-3">VIEW CONTROLS</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-black text-xs font-mono">CAMERA X: {cameraPosition[0].toFixed(1)}</label>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      step="0.5"
                      value={cameraPosition[0]}
                      onChange={(e) => setCameraPosition([parseFloat(e.target.value), cameraPosition[1], cameraPosition[2]])}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-black text-xs font-mono">CAMERA Y: {cameraPosition[1].toFixed(1)}</label>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      step="0.5"
                      value={cameraPosition[1]}
                      onChange={(e) => setCameraPosition([cameraPosition[0], parseFloat(e.target.value), cameraPosition[2]])}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-black text-xs font-mono">CAMERA Z: {cameraPosition[2].toFixed(1)}</label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="0.5"
                      value={cameraPosition[2]}
                      onChange={(e) => setCameraPosition([cameraPosition[0], cameraPosition[1], parseFloat(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-black text-xs font-mono">LIGHT INTENSITY: {lightIntensity.toFixed(1)}</label>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="0.1"
                      value={lightIntensity}
                      onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-black text-xs font-mono">AUTO ROTATE</span>
                    <button
                      onClick={() => setAutoRotate(!autoRotate)}
                      className={`px-3 py-1 border-2 text-xs font-mono transition-all ${
                        autoRotate 
                          ? 'bg-black text-white border-black' 
                          : 'border-gray-300 text-black hover:border-black'
                      }`}
                    >
                      {autoRotate ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-black text-xs font-mono">SHOW GRID</span>
                    <button
                      onClick={() => setGridVisible(!gridVisible)}
                      className={`px-3 py-1 border-2 text-xs font-mono transition-all ${
                        gridVisible 
                          ? 'bg-black text-white border-black' 
                          : 'border-gray-300 text-black hover:border-black'
                      }`}
                    >
                      {gridVisible ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-black text-xs font-mono">SHOW AXES</span>
                    <button
                      onClick={() => setAxesVisible(!axesVisible)}
                      className={`px-3 py-1 border-2 text-xs font-mono transition-all ${
                        axesVisible 
                          ? 'bg-black text-white border-black' 
                          : 'border-gray-300 text-black hover:border-black'
                      }`}
                    >
                      {axesVisible ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-2 border-black p-4 bg-white">
                <h3 className="text-black font-mono text-sm mb-3">EXPORT OPTIONS</h3>
                <div className="space-y-2">
                  <button
                    onClick={exportScene}
                    className="w-full p-3 border-2 border-gray-300 text-black text-sm font-mono hover:bg-black hover:text-white transition-all"
                  >
                    EXPORT SCENE DATA
                  </button>
                  <button
                    onClick={() => console.log('Screenshot captured')}
                    className="w-full p-3 border-2 border-gray-300 text-black text-sm font-mono hover:bg-black hover:text-white transition-all"
                  >
                    CAPTURE SCREENSHOT
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* System Configuration */}
          {selectedMenu === 'system' && (
            <div className="space-y-4">
              <div className="border-2 border-black p-4 bg-white">
                <h3 className="text-black font-mono text-sm mb-3">SYSTEM STATUS</h3>
                <div className="space-y-2 text-xs font-mono text-black/60">
                  <div>SHAPES IN SCENE: {shapes.length}</div>
                  <div>CURRENT FONT: Petit Formal Script</div>
                  <div>RENDER ENGINE: Three.js</div>
                  <div>STATUS: OPERATIONAL</div>
                </div>
              </div>

              <div className="border-2 border-black p-4 bg-white">
                <h3 className="text-black font-mono text-sm mb-3">PERFORMANCE</h3>
                <div className="space-y-2 text-xs font-mono text-black/60">
                  <div>FPS: 60</div>
                  <div>DRAW CALLS: {shapes.length * 2}</div>
                  <div>MEMORY: 12.4 MB</div>
                  <div>VERTEX COUNT: {shapes.length * 1024}</div>
                </div>
              </div>

              <div className="border-2 border-black p-4 bg-white">
                <h3 className="text-black font-mono text-sm mb-3">ADVANCED SETTINGS</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-black text-xs font-mono">SHADOW QUALITY</label>
                    <select className="w-full border-2 border-gray-300 p-2 font-mono text-xs">
                      <option>LOW</option>
                      <option>MEDIUM</option>
                      <option>HIGH</option>
                      <option>ULTRA</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-black text-xs font-mono">ANTI-ALIASING</label>
                    <select className="w-full border-2 border-gray-300 p-2 font-mono text-xs">
                      <option>OFF</option>
                      <option>2X</option>
                      <option>4X</option>
                      <option>8X</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-black text-xs font-mono">RENDER SCALE</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      defaultValue="1"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

            {/* Vertical Text */}
            <div className="absolute bottom-6 left-6 writing-mode-vertical text-black/40 font-mono text-xs tracking-wider">
              SYS.LOG // DAY 231 // FORMA 3D SHAPE GENERATOR
            </div>
          </div>
        </div>
      </div>

      {/* 3D Canvas Area */}
      <div className="absolute left-80 top-0 right-0 h-full bg-white">
        {/* 3D Canvas */}
        <div className="absolute inset-0" style={{ marginRight: '320px' }}>
          <Canvas camera={{ position: cameraPosition as [number, number, number], fov: 50 }}>
            <ambientLight intensity={lightIntensity * 0.5} />
            <pointLight position={[10, 10, 10]} intensity={lightIntensity} />
            {gridVisible && <Grid args={[20, 20]} />}
            {axesVisible && <primitive object={new THREE.AxesHelper(5)} />}
            
            {/* Environmental Effects */}
            {starsEnabled && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />}
            {sparklesEnabled && <Sparkles count={100} scale={20} speed={0.5} opacity={0.8} />}
            
            {shapes.map((shape, index) => (
              <Shape 
                key={shape.id} 
                type={shape.type} 
                position={shape.position} 
                color={shape.color} 
                wireframe={shape.wireframe}
                size={shape.size}
                metalness={shape.metalness}
                roughness={shape.roughness}
                isSelected={shape.id === selectedShapeId}
                deformationType={shape.deformationType}
                deformationStrength={shape.deformationStrength}
                effectType={shape.effectType}
                effectIntensity={shape.effectIntensity}
                onClick={() => selectShape(shape.id)}
                onPositionChange={(newPosition) => {
                  setShapes(shapes.map(s => s.id === shape.id ? { ...s, position: newPosition } : s))
                }}
                animationEnabled={shape.animationEnabled}
                colorShiftEnabled={colorShiftEnabled}
                noiseIntensity={noiseIntensity}
                glowIntensity={glowIntensity}
                rotation={shape.rotation}
                scale={shape.scale}
                materialType={shape.materialType}
                textureType={shape.textureType}
                normalMapEnabled={shape.normalMapEnabled}
                roughnessMapEnabled={shape.roughnessMapEnabled}
                metalnessMapEnabled={shape.metalnessMapEnabled}
                displacementMapEnabled={shape.displacementMapEnabled}
                emissiveMapEnabled={shape.emissiveMapEnabled}
                animationSpeed={animationSpeed}
              />
            ))}
            <OrbitControls 
              enablePan={true} 
              enableZoom={true} 
              enableRotate={autoRotate}
              autoRotate={autoRotate}
            />
          </Canvas>
        </div>

        {/* Canvas Overlay Info */}
        <div className="absolute top-4 left-4 bg-white/90 border-2 border-black p-3 font-mono text-xs">
          <div>SHAPES: {shapes.length}</div>
          <div>SELECTED: {selectedShapeId !== null ? `ID ${selectedShapeId}` : 'NONE'}</div>
          <div>CAMERA: [{cameraPosition[0].toFixed(1)}, {cameraPosition[1].toFixed(1)}, {cameraPosition[2].toFixed(1)}]</div>
          <div>LIGHT: {lightIntensity.toFixed(1)}</div>
        </div>

        {/* Right Side - Shape Manipulation Panel */}
        <div className="absolute right-0 top-0 h-full w-80 bg-white border-l-4 border-black z-20">
          <div className="h-full overflow-y-auto scrollbar-hide p-6">
            <h2 className="text-xl font-bold text-black mb-6 font-mono border-b-2 border-black pb-2">
              SHAPE MANIPULATOR
            </h2>

            {selectedShapeId !== null ? (
              <div className="space-y-4">
                {/* Selected Shape Info */}
                <div className="border-2 border-black p-4 bg-gray-50">
                  <h3 className="text-black font-mono text-sm mb-2">SELECTED SHAPE</h3>
                  <div className="text-xs font-mono text-black/60">
                    {(() => {
                      const shape = shapes.find(s => s.id === selectedShapeId)
                      return shape ? (
                        <>
                          <div>TYPE: {shape.type.toUpperCase()}</div>
                          <div>POSITION: [{shape.position[0].toFixed(1)}, {shape.position[1].toFixed(1)}, {shape.position[2].toFixed(1)}]</div>
                          <div>COLOR: {shape.color}</div>
                        </>
                      ) : null
                    })()}
                  </div>
                </div>

                {/* Position Controls */}
                <div className="border-2 border-black p-4 bg-white">
                  <h3 className="text-black font-mono text-sm mb-3">POSITION</h3>
                  <div className="space-y-3">
                    {['x', 'y', 'z'].map((axis) => (
                      <div key={axis} className="flex items-center space-x-2">
                        <span className="text-xs font-mono w-8">{axis.toUpperCase()}:</span>
                        <button 
                          onClick={() => moveSelectedShape(axis as 'x' | 'y' | 'z', -0.5)}
                          className="px-2 py-1 border border-black text-xs font-mono hover:bg-black hover:text-white"
                        >
                          -
                        </button>
                        <button 
                          onClick={() => moveSelectedShape(axis as 'x' | 'y' | 'z', 0.5)}
                          className="px-2 py-1 border border-black text-xs font-mono hover:bg-black hover:text-white"
                        >
                          +
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Effects Controls */}
                <div className="border-2 border-black p-4 bg-white">
                  <h3 className="text-black font-mono text-sm mb-3">ADVANCED EFFECTS</h3>
                  <div className="space-y-3">
                    <select 
                      value={(() => {
                        const shape = shapes.find(s => s.id === selectedShapeId)
                        return shape?.effectType || 'none'
                      })()}
                      onChange={(e) => updateSelectedShape({ effectType: e.target.value })}
                      className="w-full border-2 border-gray-300 p-2 font-mono text-xs"
                    >
                      <option value="none">NONE</option>
                      <option value="glow">GLOW</option>
                      <option value="transparent">TRANSPARENT</option>
                      <option value="metallic">METALLIC</option>
                      <option value="hologram">HOLOGRAM</option>
                      <option value="plasma">PLASMA</option>
                    </select>
                    <div>
                      <label className="text-black text-xs font-mono">INTENSITY: {(() => {
                        const shape = shapes.find(s => s.id === selectedShapeId)
                        return shape?.effectIntensity?.toFixed(1) || '0.0'
                      })()}</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={(() => {
                          const shape = shapes.find(s => s.id === selectedShapeId)
                          return shape?.effectIntensity || 0
                        })()}
                        onChange={(e) => updateSelectedShape({ effectIntensity: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Deformation Controls */}
                <div className="border-2 border-black p-4 bg-white">
                  <h3 className="text-black font-mono text-sm mb-3">DEFORMATION</h3>
                  <div className="space-y-3">
                    <select 
                      value={(() => {
                        const shape = shapes.find(s => s.id === selectedShapeId)
                        return shape?.deformationType || 'none'
                      })()}
                      onChange={(e) => updateSelectedShape({ deformationType: e.target.value })}
                      className="w-full border-2 border-gray-300 p-2 font-mono text-xs"
                    >
                      <option value="none">NONE</option>
                      <option value="twist">TWIST</option>
                      <option value="scale">SCALE</option>
                      <option value="squeeze">SQUEEZE</option>
                      <option value="wave">WAVE</option>
                      <option value="spike">SPIKE</option>
                    </select>
                    <div>
                      <label className="text-black text-xs font-mono">STRENGTH: {(() => {
                        const shape = shapes.find(s => s.id === selectedShapeId)
                        return shape?.deformationStrength?.toFixed(1) || '0.0'
                      })()}</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={(() => {
                          const shape = shapes.find(s => s.id === selectedShapeId)
                          return shape?.deformationStrength || 0
                        })()}
                        onChange={(e) => updateSelectedShape({ deformationStrength: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Animation Controls */}
                <div className="border-2 border-black p-4 bg-white">
                  <h3 className="text-black font-mono text-sm mb-3">ANIMATION</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-black text-xs font-mono">ENABLE ANIMATION</span>
                      <button
                        onClick={() => updateSelectedShape({ animationEnabled: !(() => {
                          const shape = shapes.find(s => s.id === selectedShapeId)
                          return shape?.animationEnabled || false
                        })() })}
                        className={`px-3 py-1 border-2 text-xs font-mono transition-all ${
                          (() => {
                            const shape = shapes.find(s => s.id === selectedShapeId)
                            return shape?.animationEnabled
                          })()
                            ? 'bg-black text-white border-black' 
                            : 'border-gray-300 text-black hover:border-black'
                        }`}
                      >
                        {(() => {
                          const shape = shapes.find(s => s.id === selectedShapeId)
                          return shape?.animationEnabled ? 'ON' : 'OFF'
                        })()}
                      </button>
                    </div>
                    <div>
                      <label className="text-black text-xs font-mono">GLOBAL SPEED: {animationSpeed.toFixed(1)}</label>
                      <input
                        type="range"
                        min="0"
                        max="3"
                        step="0.1"
                        value={animationSpeed}
                        onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Material Controls */}
                <div className="border-2 border-black p-4 bg-white">
                  <h3 className="text-black font-mono text-sm mb-3">MATERIAL TYPE</h3>
                  <div className="space-y-3">
                    <select 
                      value={(() => {
                        const shape = shapes.find(s => s.id === selectedShapeId)
                        return shape?.materialType || 'standard'
                      })()}
                      onChange={(e) => updateSelectedShape({ materialType: e.target.value })}
                      className="w-full border-2 border-gray-300 p-2 font-mono text-xs"
                    >
                      <option value="standard">STANDARD</option>
                      <option value="basic">BASIC</option>
                      <option value="phong">PHONG</option>
                      <option value="lambert">LAMBERT</option>
                      <option value="physical">PHYSICAL</option>
                      <option value="toon">TOON</option>
                      <option value="depth">DEPTH</option>
                      <option value="normal">NORMAL</option>
                    </select>
                    <div>
                      <label className="text-black text-xs font-mono">SIZE: {(() => {
                        const shape = shapes.find(s => s.id === selectedShapeId)
                        return shape?.size?.toFixed(1) || '1.0'
                      })()}</label>
                      <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.1"
                        value={(() => {
                          const shape = shapes.find(s => s.id === selectedShapeId)
                          return shape?.size || 1
                        })()}
                        onChange={(e) => updateSelectedShape({ size: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-black text-xs font-mono">METALNESS: {(() => {
                        const shape = shapes.find(s => s.id === selectedShapeId)
                        return shape?.metalness?.toFixed(1) || '0.0'
                      })()}</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={(() => {
                          const shape = shapes.find(s => s.id === selectedShapeId)
                          return shape?.metalness || 0
                        })()}
                        onChange={(e) => updateSelectedShape({ metalness: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-black text-xs font-mono">ROUGHNESS: {(() => {
                        const shape = shapes.find(s => s.id === selectedShapeId)
                        return shape?.roughness?.toFixed(1) || '1.0'
                      })()}</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={(() => {
                          const shape = shapes.find(s => s.id === selectedShapeId)
                          return shape?.roughness || 1
                        })()}
                        onChange={(e) => updateSelectedShape({ roughness: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Transform Controls */}
                <div className="border-2 border-black p-4 bg-white">
                  <h3 className="text-black font-mono text-sm mb-3">TRANSFORM</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-black text-xs font-mono">ROTATION</label>
                      <div className="grid grid-cols-3 gap-1">
                        {['x', 'y', 'z'].map((axis) => (
                          <div key={axis} className="flex items-center space-x-1">
                            <span className="text-xs font-mono w-4">{axis.toUpperCase()}:</span>
                            <button 
                              onClick={() => rotateSelectedShape(axis as 'x' | 'y' | 'z', -0.1)}
                              className="px-1 py-1 border border-black text-xs font-mono hover:bg-black hover:text-white"
                            >
                              -
                            </button>
                            <button 
                              onClick={() => rotateSelectedShape(axis as 'x' | 'y' | 'z', 0.1)}
                              className="px-1 py-1 border border-black text-xs font-mono hover:bg-black hover:text-white"
                            >
                              +
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-black text-xs font-mono">SCALE: {(() => {
                        const shape = shapes.find(s => s.id === selectedShapeId)
                        return shape?.scale[0]?.toFixed(1) || '1.0'
                      })()}</label>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => scaleSelectedShape(-0.1)}
                          className="px-2 py-1 border border-black text-xs font-mono hover:bg-black hover:text-white"
                        >
                          -
                        </button>
                        <button 
                          onClick={() => scaleSelectedShape(0.1)}
                          className="px-2 py-1 border border-black text-xs font-mono hover:bg-black hover:text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => updateSelectedShape({ wireframe: !(() => {
                      const shape = shapes.find(s => s.id === selectedShapeId)
                      return shape?.wireframe || false
                    })() })}
                    className="w-full p-3 border-2 border-black text-black text-sm font-mono hover:bg-black hover:text-white transition-all"
                  >
                    TOGGLE WIREFRAME
                  </button>
                  <button
                    onClick={deleteSelectedShape}
                    className="w-full p-3 border-2 border-black text-black text-sm font-mono hover:bg-red-600 hover:text-white transition-all"
                  >
                    DELETE SHAPE
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-black/60 font-mono text-sm mb-4">
                  NO SHAPE SELECTED
                </div>
                <div className="text-black/40 font-mono text-xs">
                  Click on a shape in the canvas to select it
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Execute Button */}
        <div className="absolute right-8 bottom-8 z-20">
          <button
            className="border-4 border-black bg-white text-black px-12 py-6 font-mono text-lg font-bold hover:bg-black hover:text-white transition-all hover:scale-105 active:scale-95"
          >
            [ EXECUTE ]
          </button>
        </div>
      </div>

      {/* Footer Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-black border-t-2 border-black flex items-center justify-between px-8 z-30">
        <span className="text-white font-mono text-xs">27.04.15</span>
        <span className="text-white font-mono text-xs">8PM-1.30AM</span>
        <span className="text-white font-mono text-xs">TERMINAL DESIGN ENVIRONMENT, V-3.2 LOCALHOST</span>
      </div>
    </div>
  )
}
