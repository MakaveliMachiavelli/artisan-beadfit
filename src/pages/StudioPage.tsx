import React, { useState, useMemo, useEffect, Suspense, lazy } from 'react';
import { useStudioStore } from '../store/useStudioStore';
import { useCatalogStore } from '../store/useCatalogStore';
import { useDesignStore } from '../store/useDesignStore';
import { 
  Sparkles, 
  ShieldCheck, 
  Eye, 
  Settings, 
  Package, 
  Coins, 
  Plus, 
  Minus, 
  Info, 
  Lock, 
  Unlock, 
  Copy, 
  Share2, 
  Check, 
  RotateCcw, 
  ChevronRight,
  Sliders,
  Sparkle,
  ShoppingBag,
  HelpCircle,
  TrendingUp,
  Award,
  Video,
  Upload,
  Play,
  Film,
  RefreshCw,
  Download,
  AlertCircle,
  Clock,
  RotateCw,
  Maximize2
} from 'lucide-react';
import { BeadInstance, CatalogItem, DesignPreset, AddonOption, Voucher } from '../types';
import { 
  GEMSTONE_DB, 
  generateDefaultCatalog, 
  DESIGN_PRESETS, 
  ADDON_OPTIONS, 
  DEFAULT_VOUCHERS, 
  SIZES 
} from '../data';
import { analyzeBeadDesign, generateGoldenRatioSequence } from '../utils';
import { calculateBraceletFit } from '../braceletFit';
import { calculateBasePrice } from '../pricing';
import { calculateBlueprintMetrics, calculateBeadCountForCircumference, calculateInnerFit } from '../geometry';
import { injectFocalWord, addBeadSymmetrically, removeBeadSymmetrically } from '../symmetry';
import { useAuthStore } from "../store/useAuthStore";
import { useCartStore } from "../store/useCartStore";
import { useSavedDesignsStore } from "../store/useSavedDesignsStore";
import { Save } from "lucide-react";
import { AuthModal } from "../components/AuthModal";
import { LogOut, User } from "lucide-react";

const LazyBackground3D = lazy(() => import('../components/Background3D').then(m => ({ default: m.Background3D })));
const Background3D = (props: any) => <Suspense fallback={null}><LazyBackground3D {...props} /></Suspense>;


const LazyBracelet3D = lazy(() => import('../components/Bracelet3D').then(m => ({ default: m.Bracelet3D })));
const Bracelet3D = (props: any) => <Suspense fallback={null}><LazyBracelet3D {...props} /></Suspense>;


const LazyBlueprint2D = lazy(() => import('../components/Blueprint2D').then(m => ({ default: m.Blueprint2D })));
const Blueprint2D = (props: any) => <Suspense fallback={null}><LazyBlueprint2D {...props} /></Suspense>;


const LazyExpertAssessment = lazy(() => import('../components/ExpertAssessment').then(m => ({ default: m.ExpertAssessment })));
const ExpertAssessment = (props: any) => <Suspense fallback={null}><LazyExpertAssessment {...props} /></Suspense>;


const LazyAdminPanelModal = lazy(() => import('../components/AdminPanelModal').then(m => ({ default: m.AdminPanelModal })));
const AdminPanelModal = (props: any) => <Suspense fallback={null}><LazyAdminPanelModal {...props} /></Suspense>;


const LazyFitCalibrationPanel = lazy(() => import('../components/FitCalibrationPanel').then(m => ({ default: m.FitCalibrationPanel })));
const FitCalibrationPanel = (props: any) => <Suspense fallback={null}><LazyFitCalibrationPanel {...props} /></Suspense>;


const LazyLetterBeadSequencer = lazy(() => import('../components/LetterBeadSequencer').then(m => ({ default: m.LetterBeadSequencer })));
const LetterBeadSequencer = (props: any) => <Suspense fallback={null}><LazyLetterBeadSequencer {...props} /></Suspense>;


const LazySequenceEditorPanel = lazy(() => import('../components/SequenceEditorPanel').then(m => ({ default: m.SequenceEditorPanel })));
const SequenceEditorPanel = (props: any) => <Suspense fallback={null}><LazySequenceEditorPanel {...props} /></Suspense>;


const LazyGemstoneSelectorPanel = lazy(() => import('../components/GemstoneSelectorPanel').then(m => ({ default: m.GemstoneSelectorPanel })));
const GemstoneSelectorPanel = (props: any) => <Suspense fallback={null}><LazyGemstoneSelectorPanel {...props} /></Suspense>;


const LazyCheckoutModal = lazy(() => import('../components/CheckoutModal').then(m => ({ default: m.CheckoutModal })));
const CheckoutModal = (props: any) => <Suspense fallback={null}><LazyCheckoutModal {...props} /></Suspense>;



export default function StudioPage() {
  // --- STATE ---
  const { user, checkSession, logout } = useAuthStore();
  const { fetchCart, cart } = useCartStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { designs, fetchDesigns, saveDesign } = useSavedDesignsStore();

  // Initial load of default preset
  useEffect(() => {
    if (beads.length === 0) {
      const defaultPreset = DESIGN_PRESETS.find(p => p.name === 'Coral Jade Fossil');
      if (defaultPreset) applyPreset(defaultPreset);
    }
  }, []);

  useEffect(() => {
    checkSession();
    fetchCart();
    fetchDesigns();
  }, []);
  
  useEffect(() => {
    if (user) {
      fetchDesigns();
      fetchCart();
    }
  }, [user]);

  const {
    wristMm, setWristMm,
    unit, setUnit,
    ease, setEase,
    activeTab, setActiveTab,
    previewMode, setPreviewMode,
    packaging, setPackaging,
    xrayMode, setXrayMode
  } = useStudioStore();

  const {
    catalog, setCatalog,
    markup, setMarkup,
    laborCost, setLaborCost,
    packingCost, setPackingCost
  } = useCatalogStore();

  const {
    mainStone, setMainStone,
    mainSize, setMainSize,
    mainQuality, setMainQuality,
    activeSpacerId, setActiveSpacerId,
    selectedCharmId, setSelectedCharmId,
    customWord, setCustomWord,
    letterStyle, setLetterStyle,
    beads, setBeads
  } = useDesignStore();

  // Dynamic Atmosphere Theme Engine
  useEffect(() => {
    const THEME_COLORS: Record<string, { primary: string, bg: string, soft: string }> = {
      'Lapis Lazuli': { primary: '#1e3a8a', bg: '#eff6ff', soft: '#dbeafe' },
      'Amethyst': { primary: '#581c87', bg: '#faf5ff', soft: '#f3e8ff' },
      'Tiger Eye': { primary: '#b45309', bg: '#fffbeb', soft: '#fef3c7' },
      'Jade': { primary: '#047857', bg: '#ecfdf5', soft: '#d1fae5' },
      'Onyx': { primary: '#334155', bg: '#f8fafc', soft: '#e2e8f0' },
      'Rose Quartz': { primary: '#be185d', bg: '#fdf2f8', soft: '#fce7f3' },
      'Carnelian': { primary: '#9a3412', bg: '#fff7ed', soft: '#ffedd5' },
      'Turquoise': { primary: '#0f766e', bg: '#f0fdfa', soft: '#ccfbf1' },
      'Citrine': { primary: '#a16207', bg: '#fefce8', soft: '#fef08a' },
      'Pearl': { primary: '#0f172a', bg: '#f8fafc', soft: '#f1f5f9' },
    };
    
    const theme = THEME_COLORS[mainStone] || THEME_COLORS['Onyx'];
    
    document.documentElement.style.setProperty('--theme-primary', theme.primary);
    document.documentElement.style.setProperty('--theme-bg', theme.bg);
    document.documentElement.style.setProperty('--theme-soft', theme.soft);
  }, [mainStone]);

  
  // Custom spacer selections
  // Custom word state




  useEffect(() => {
    setBeads(prev => injectFocalWord(prev, customWord, letterStyle));
  }, [customWord, letterStyle]);

  // Beads array state
  const [selectedBeadIndex, setSelectedBeadIndex] = useState<number | null>(null);

  // Checkout & Order Form
  const [isOrderOpen, setIsOrderOpen] = useState<boolean>(false);
  
  // Admin Panel
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  
  // Admin Editing states for catalog

  const [toastMsg, setToastMsg] = useState<string>('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // --- ROTATION & SPINNING SYSTEM STATES ---
  const [isSpinning, setIsSpinning] = useState<boolean>(true);
  const [spinSpeed, setSpinSpeed] = useState<'slow' | 'medium' | 'fast'>('slow');
  const [manualAngle, setManualAngle] = useState<number>(0);

  // --- VEO VIDEO GENERATION STATES ---
  const [veoImage, setVeoImage] = useState<string | null>(null);
  const [veoMime, setVeoMime] = useState<string>('image/png');
  const [veoPrompt, setVeoPrompt] = useState<string>('A high-end cinematic studio animation of this gemstone bracelet, rotating slowly on a velvet cushion with soft sparkles.');
  const [veoAspectRatio, setVeoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [veoOperationName, setVeoOperationName] = useState<string | null>(null);
  const [veoStatus, setVeoStatus] = useState<'idle' | 'generating' | 'success' | 'failed'>('idle');
  const [veoProgressMsg, setVeoProgressMsg] = useState<string>('');
  const [veoVideoUrl, setVeoVideoUrl] = useState<string | null>(null);
  const [veoError, setVeoError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: any;
    let msgInterval: any;
    
    if (veoStatus === 'generating' && veoOperationName) {
      const messages = [
        "Calibrating mineral refractive indexes...",
        "Rendering ray-traced ambient lighting...",
        "Polishing gemstone specular highlights...",
        "Generating cinematic camera path...",
        "Weaving high-fidelity motion vectors...",
        "Performing final light bounces..."
      ];
      let msgIndex = 0;
      setVeoProgressMsg(messages[0]);

      msgInterval = setInterval(() => {
        msgIndex = (msgIndex + 1) % messages.length;
        setVeoProgressMsg(messages[msgIndex]);
      }, 6000);

      const pollStatus = async () => {
        try {
          const res = await fetch('/api/video-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName: veoOperationName })
          });
          
          if (!res.ok) {
            throw new Error('Failed to query generation status');
          }

          const data = await res.json();
          if (data.error) {
            throw new Error(data.error.message || 'Operation failed');
          }

          if (data.done) {
            clearInterval(msgInterval);
            clearInterval(intervalId);
            
            setVeoProgressMsg("Downloading completed video...");
            
            const downloadRes = await fetch('/api/video-download', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ operationName: veoOperationName })
            });

            if (!downloadRes.ok) {
              throw new Error('Failed to stream the completed video file.');
            }

            const blob = await downloadRes.blob();
            const url = URL.createObjectURL(blob);
            setVeoVideoUrl(url);
            setVeoStatus('success');
          }
        } catch (err: any) {
          console.error(err);
          clearInterval(msgInterval);
          clearInterval(intervalId);
          setVeoError(err.message || 'Video generation failed.');
          setVeoStatus('failed');
        }
      };

      pollStatus();
      intervalId = setInterval(pollStatus, 4500);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (msgInterval) clearInterval(msgInterval);
    };
  }, [veoStatus, veoOperationName]);

  const startVeoGeneration = async () => {
    if (!veoImage) {
      setVeoError("Please upload or drag a photo first.");
      return;
    }
    setVeoError(null);
    setVeoVideoUrl(null);
    setVeoStatus('generating');
    setVeoProgressMsg("Initializing Veo motion operation...");

    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: veoImage,
          mimeType: veoMime,
          prompt: veoPrompt,
          aspectRatio: veoAspectRatio
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Server rejected video generation start');
      }

      const data = await res.json();
      if (!data.operationName) {
        throw new Error('Did not receive operationName from the server');
      }

      setVeoOperationName(data.operationName);
    } catch (err: any) {
      console.error(err);
      setVeoError(err.message || "Failed to start generation.");
      setVeoStatus('failed');
    }
  };

  const [dragActive, setDragActive] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setVeoError("Please select a valid image file.");
      return;
    }
    setVeoMime(file.type);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setVeoImage(event.target.result as string);
        setVeoError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // --- DERIVED / CACHED INFO ---
  const activeMainItem = useMemo(() => {
    return catalog.find(
      i => i.type === 'stone' && i.name === mainStone && i.size === mainSize && (i.quality === mainQuality)
    ) || catalog.find(
      i => i.type === 'stone' && i.name === mainStone && i.size === mainSize
    ) || catalog.find(
      i => i.type === 'stone' && i.name === mainStone
    );
  }, [catalog, mainStone, mainSize, mainQuality]);

  const activeSpacer = useMemo(() => {
    return catalog.find(i => i.id === activeSpacerId) || null;
  }, [catalog, activeSpacerId]);

  const activeCharm = useMemo(() => {
    return catalog.find(i => i.id === selectedCharmId) || null;
  }, [catalog, selectedCharmId]);

  const gemstoneNames = useMemo(() => {
    return [...new Set(catalog.filter(i => i.type === 'stone').map(i => i.name))];
  }, [catalog]);

  const sizesForActiveStone = useMemo(() => {
    return ([...new Set(catalog.filter(i => i.type === 'stone' && i.name === mainStone).map(i => i.size))] as number[]).sort((a,b)=>a-b);
  }, [catalog, mainStone]);

  const qualitiesForActiveStoneSize = useMemo(() => {
    return [...new Set(catalog.filter(i => i.type === 'stone' && i.name === mainStone && i.size === mainSize).map(i => i.quality || 'Standard Grade'))];
  }, [catalog, mainStone, mainSize]);

  const availableSpacers = useMemo(() => {
    return catalog.filter(i => i.type === 'spacer');
  }, [catalog]);

  const availableCharms = useMemo(() => {
    return catalog.filter(i => i.type === 'charm');
  }, [catalog]);

  // --- AUTO-FIT LOGIC ---
  const autoFitBracelet = () => {
    if (!activeMainItem) return;
    
    // Check if it's the exact 19/19 Coral Jade pattern
    const isCoralJadeFossil = beads.length === 38 && beads.filter(b => b.name === 'Jade Spacer').length === 19 && beads.some(b => b.name.includes('Coral Jade'));
    if (isCoralJadeFossil) {
        // Do not auto-fit this strict design
        return;
    }

    let currentBeads = [...beads];
    const targetMm = wristMm + ease;
    const mainSz = activeMainItem.size;

    if (currentBeads.length === 0) {
      // Generate basic list of main stones
      const theoreticalCount = calculateBeadCountForCircumference(targetMm, mainSz);
      let beadCount = Math.round(theoreticalCount);
      if (beadCount < 10) beadCount = 10; // minimum structural beads

      for (let i = 0; i < beadCount; i++) {
        currentBeads.push({
          id: `bead-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
          itemId: activeMainItem.id,
          type: 'stone',
          name: activeMainItem.name,
          quality: activeMainItem.quality,
          size: activeMainItem.size,
          lengthMm: activeMainItem.lengthMm,
          hex: activeMainItem.hex,
          secondaryHex: activeMainItem?.secondaryHex,
          cost: activeMainItem.cost
        });
      }
    }
    
    let iterations = 0;
    while (iterations < 50) {
      iterations++;
      
      const totalBeadLength = currentBeads.reduce((sum, b) => sum + b.lengthMm, 0);
      const avgBeadSize = currentBeads.reduce((sum, b) => sum + b.size, 0) / currentBeads.length;
      const calculatedInnerFit = calculateInnerFit(totalBeadLength, avgBeadSize);
      
      const discrepancy = calculatedInnerFit - targetMm;
      
      // If discrepancy is within +/- 4mm, we consider it a perfect fit.
      if (Math.abs(discrepancy) <= 4.0) {
        break; 
      }
      
      if (discrepancy < -4.0) {
        // Too tight, we need to insert beads symmetrically.
        const newBead = {
          id: `bead-${Date.now()}-${iterations}-${Math.random().toString(36).substring(2, 6)}`,
          itemId: activeMainItem.id,
          type: 'stone' as const,
          name: activeMainItem.name,
          quality: activeMainItem.quality,
          size: activeMainItem.size,
          lengthMm: activeMainItem.lengthMm,
          hex: activeMainItem.hex,
          secondaryHex: activeMainItem?.secondaryHex,
          cost: activeMainItem.cost
        };
        currentBeads = addBeadSymmetrically(currentBeads, newBead, iterations);
      } else if (discrepancy > 4.0 && currentBeads.length > 6) {
        // Too loose, remove beads symmetrically.
        currentBeads = removeBeadSymmetrically(currentBeads);
      } else {
        break; // can't remove any more
      }
    }

    setBeads(injectFocalWord(currentBeads, customWord, letterStyle));
    setSelectedBeadIndex(null);
    showToast('Optimal fit calculated.');
  };

  // Run auto-fit once on mount
  useEffect(() => {
    autoFitBracelet();
  }, [mainStone, mainSize, mainQuality, wristMm, ease]);

  // --- GOLDEN RATIO CUSTOMIZER ---
  const applyGoldenRatioAutoStyle = () => {
    if (!activeMainItem) return;
    const targetMm = wristMm + ease;
    const items = generateGoldenRatioSequence(
      activeMainItem,
      activeSpacer,
      activeCharm,
      targetMm,
      catalog
    );

    const newBeads: BeadInstance[] = items.map((it, idx) => ({
      id: `bead-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
      itemId: it.id,
      type: it.type,
      name: it.name,
      quality: it.quality,
      size: it.size,
      lengthMm: it.lengthMm,
      hex: it.hex,
      secondaryHex: it?.secondaryHex,
      cost: it.cost
    }));

    setBeads(injectFocalWord(newBeads, customWord, letterStyle));
    setSelectedBeadIndex(null);
    showToast('Golden Ratio symmetry applied.');
  };

  // Apply a preset
  const applyPreset = (preset: DesignPreset) => {
    setMainSize(preset.size);
    // Find the first stone of the pattern
    const stoneName = preset.pattern[0];
    if (gemstoneNames.includes(stoneName)) {
      setMainStone(stoneName);
    }

    // Wait for the states to queue up and construct the pattern
    const targetMm = wristMm + ease;
    const mainItem = catalog.find(i => i.type === 'stone' && i.name === stoneName && i.size === preset.size) || activeMainItem;
    if (!mainItem) return;

    // Build the pattern array
    const patternItems = preset.pattern.map(name => {
      const exactMatch = catalog.find(i => i.type === 'stone' && i.name === name && i.size === preset.size);
      if (exactMatch) return exactMatch;
      // Fallback: ignore size if the item exists in another size (e.g. specialized shapes)
      const nameMatch = catalog.find(i => i.type === 'stone' && i.name === name);
      return nameMatch || mainItem;
    });

    const theoreticalCount = calculateBeadCountForCircumference(targetMm, preset.size);
    let totalCount = Math.round(theoreticalCount);
    
    // If the preset defines a full-length exact pattern (like our 19/19 Coral Jade design), use it exactly
    if (preset.name === 'Coral Jade Fossil') {
       totalCount = preset.pattern.length;
    }

    const newBeads: BeadInstance[] = [];
    for (let i = 0; i < totalCount; i++) {
      const proto = patternItems[i % patternItems.length];
      newBeads.push({
        id: `bead-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
        itemId: proto.id,
        type: proto.type,
        name: proto.name,
        quality: proto.quality,
        size: proto.size,
        lengthMm: proto.lengthMm,
        hex: proto.hex,
        secondaryHex: proto?.secondaryHex,
        cost: proto.cost
      });
    }

    setBeads(injectFocalWord(newBeads, customWord, letterStyle));
    setSelectedBeadIndex(null);
    showToast(`Preset "${preset.name}" applied.`);
  };

  // --- BEAD COUNTERS & MODIFICATION ---
  const handleAddBead = () => {
    if (!activeMainItem) return;
    const newBead: BeadInstance = {
      id: `bead-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      itemId: activeMainItem.id,
      type: 'stone',
      name: activeMainItem.name,
      quality: activeMainItem.quality,
      size: activeMainItem.size,
      lengthMm: activeMainItem.lengthMm,
      hex: activeMainItem.hex,
      secondaryHex: activeMainItem?.secondaryHex,
      cost: activeMainItem.cost
    };
    setBeads(injectFocalWord([...beads, newBead], customWord, letterStyle));
    setSelectedBeadIndex(null);
  };

  const handleRemoveBead = () => {
    if (beads.length <= 6) {
      showToast('Minimum 6 beads required to maintain structure.');
      return;
    }
    setBeads(injectFocalWord(beads.slice(0, beads.length - 1), customWord, letterStyle));
    setSelectedBeadIndex(null);
  };

  const handleSwapSelectedBead = (catalogItem: CatalogItem) => {
    if (selectedBeadIndex === null) return;
    const updated = [...beads];
    updated[selectedBeadIndex] = {
      ...updated[selectedBeadIndex],
      itemId: catalogItem.id,
      type: catalogItem.type,
      name: catalogItem.name,
      quality: catalogItem.quality,
      size: catalogItem.size,
      lengthMm: catalogItem.lengthMm,
      hex: catalogItem.hex,
      secondaryHex: catalogItem?.secondaryHex,
      cost: catalogItem.cost
    };
    setBeads(injectFocalWord(updated, customWord, letterStyle));
    showToast(`Bead ${selectedBeadIndex + 1} updated.`);
  };

  const handleRemoveSelectedBead = () => {
    if (selectedBeadIndex === null) return;
    if (beads.length <= 6) {
      showToast('Minimum 6 beads required.');
      return;
    }
    const updated = beads.filter((_, idx) => idx !== selectedBeadIndex);
    setBeads(injectFocalWord(updated, customWord, letterStyle));
    setSelectedBeadIndex(null);
    showToast('Bead removed from sequence.');
  };

  // --- ANALYZER STATS ---
  const designStats = useMemo(() => {
    const fitStats = calculateBraceletFit(beads, wristMm, ease);
    const priceStats = calculateBasePrice(beads, activeCharm, laborCost, markup);

    return {
      length: fitStats.totalBeadLength,
      avgSize: fitStats.avgBeadSize,
      innerFit: fitStats.innerFit,
      target: fitStats.targetMm,
      discrepancy: fitStats.discrepancy,
      status: fitStats.status,
      price: priceStats.basePrice
    };
  }, [beads, wristMm, ease, activeCharm, laborCost, markup]);

  const expertAnalysis = useMemo(() => {
    return analyzeBeadDesign(beads, wristMm, ease);
  }, [beads, wristMm, ease]);

  // --- BLUEPRINT GAPS FOR X-RAY ---
  // Wrist circumference R_wrist = Wrist / 2pi
  // Target circumference R_target = Target / 2pi
  // Bead centers ride on R_center = R_wrist + average_bead_radius
  // This calculates how much the bead thickness restricts the inner space.
  const blueprintMetrics = useMemo(() => {
    return calculateBlueprintMetrics(wristMm, designStats.target, designStats.avgSize);
  }, [wristMm, designStats]);

  // --- UTILS / HANDLERS ---
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const formattedWristVal = () => {
    if (unit === 'cm') return (wristMm / 10).toFixed(1);
    if (unit === 'in') return (wristMm / 25.4).toFixed(2);
    return wristMm.toString();
  };

  const handleWristInputChange = (val: string) => {
    const parsed = parseFloat(val);
    if (isNaN(parsed)) return;

    let targetMm = parsed;
    if (unit === 'cm') targetMm = parsed * 10;
    else if (unit === 'in') targetMm = parsed * 25.4;

    // Bounds safety
    if (targetMm < 110) targetMm = 110;
    if (targetMm > 230) targetMm = 230;

    setWristMm(Math.round(targetMm));
  };


  return (
    <>
      <div className="min-h-screen pb-16 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-[var(--theme-primary)] text-gold-100 border border-gold-300 px-6 py-3 rounded-full text-sm font-mono shadow-xl transition-all duration-300">
          ✨ {toastMsg}
        </div>
      )}

      {/* Header section */}
      <header className="py-8 text-center md:text-left border-b hairline border-obsidian-200/50 mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <span className="font-mono text-[10px] tracking-[0.3em] text-gold-500 font-semibold">Est. 2024 • Bespoke Jewelry Studio</span>
          <h1 className="font-serif text-4xl md:text-5xl font-light tracking-tighter italic text-[var(--theme-primary)] mt-2">
            Artisan Beadfit
          </h1>
          <p className="font-sans text-sm text-obsidian-500 mt-2 max-w-xl leading-relaxed">
            Crafting tactile gemstone connections. Calibrate mineral geometries to your precise wrist proportions, visualize physical clearance, and dispatch direct orders.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsOrderOpen(true)} className="px-6 py-3 bg-[var(--theme-primary)] text-white hover:opacity-90 font-mono text-xs uppercase tracking-widest rounded-sm transition-all shadow-md">
            Review Design
          </button>
          <button onClick={() => setIsAdminOpen(true)} className="p-2 border hairline border-obsidian-200/50 text-obsidian-600 hover:text-[var(--theme-primary)] rounded-sm glass-panel transition-all" title="Studio Terminal">
            <Sparkles className="w-5 h-5" />
          </button>
          {user ? (
            <button onClick={logout} className="p-2 border hairline border-obsidian-200/50 text-obsidian-600 hover:text-red-500 rounded-sm glass-panel transition-all" title="Log Out">
              <LogOut className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={() => setIsAuthOpen(true)} className="p-2 border hairline border-obsidian-200/50 text-obsidian-600 hover:text-[var(--theme-primary)] rounded-sm glass-panel transition-all" title="Log In">
              <User className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        {/* Left Column: Gemstone & Styling Controls */}
        <div className="lg:col-span-4 space-y-6">
          <GemstoneSelectorPanel 
            gemstoneNames={gemstoneNames}
            mainStone={mainStone}
            setMainStone={setMainStone}
            catalog={catalog}
            mainSize={mainSize}
            setMainSize={setMainSize}
            showToast={showToast}
            sizesForActiveStone={sizesForActiveStone}
            qualitiesForActiveStoneSize={qualitiesForActiveStoneSize}
            mainQuality={mainQuality}
            setMainQuality={setMainQuality}
            markup={markup}
          />
          <FitCalibrationPanel 
            unit={unit}
            setUnit={setUnit}
            wristMm={wristMm}
            setWristMm={setWristMm}
            ease={ease}
            setEase={setEase}
            showToast={showToast}
          />
          <LetterBeadSequencer 
            customWord={customWord}
            setCustomWord={setCustomWord}
            letterStyle={letterStyle}
            setLetterStyle={setLetterStyle}
          />
          <SequenceEditorPanel 
            availableSpacers={availableSpacers}
            activeSpacerId={activeSpacerId}
            setActiveSpacerId={setActiveSpacerId}
            availableCharms={availableCharms}
            selectedCharmId={selectedCharmId}
            setSelectedCharmId={setSelectedCharmId}
            markup={markup}
            applyGoldenRatioAutoStyle={applyGoldenRatioAutoStyle}
            autoFitBracelet={autoFitBracelet}
            beadsCount={beads.length}
            designLength={designStats.length}
            handleAddBead={handleAddBead}
            handleRemoveBead={handleRemoveBead}
          />
        </div>

        {/* Center Column: 3D Visualization */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Main 3D Stage */}
          <div className="h-[60vh] lg:h-[70vh] rounded-xl overflow-hidden shadow-2xl border hairline border-obsidian-200/50 bg-[#f2f2f4]">
            <Bracelet3D
              beads={beads}
              activeCharm={activeCharm}
              selectedBeadIndex={selectedBeadIndex}
              setSelectedBeadIndex={setSelectedBeadIndex}
              blueprintRadius={(wristMm + ease) / (2 * Math.PI) / 10}
              wristMm={wristMm}
              ease={ease}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Blueprint2D
               beads={beads}
               gemstoneNames={gemstoneNames}
               xrayMode={true}
               designStats={designStats}
               isSpinning={false}
               manualAngle={manualAngle}
               activeCharm={activeCharm}
               selectedBeadIndex={selectedBeadIndex}
               setSelectedBeadIndex={setSelectedBeadIndex}
               wristMm={wristMm}
               spinSpeed={spinSpeed}
               blueprintMetrics={blueprintMetrics}
            />
            <ExpertAssessment 
               expertAnalysis={expertAnalysis}
            />
          </div>
          
          {/* Presets Gallery (from original UI) */}
          <div className="mt-8 border hairline border-obsidian-200/50 p-6 rounded-sm glass-panel bg-white/40">
            <h3 className="font-serif text-lg text-obsidian-900 mb-4">Masterpiece Archives</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {DESIGN_PRESETS.map((p) => {
                const firstStone = catalog.find(i => i.name === p.pattern[0]);
                const secStone = catalog.find(i => i.name === p.pattern[1]);
                if (!firstStone || !secStone) return null;
                return (
                  <button
                    key={p.name}
                    onClick={() => applyPreset(p)}
                    className="group text-left p-3.5 border hairline border-obsidian-200/50 rounded-sm glass-panel hover:glass-panel hover:border-gold-400 transition-all duration-300"
                  >
                    <div className="flex gap-1.5 mb-2.5">
                      <span className="w-3.5 h-3.5 rounded-full shadow-inner" style={{ backgroundColor: firstStone.hex }} />
                      <span className="w-3.5 h-3.5 rounded-full shadow-inner" style={{ backgroundColor: secStone.hex }} />
                    </div>
                    <h4 className="font-serif text-sm font-semibold text-[var(--theme-primary)] leading-tight group-hover:text-gold-600 transition-colors">
                      {p.name}
                    </h4>
                    <span className="font-mono text-[10px] text-obsidian-400 block mt-0.5">{p.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      </div>
      
      {/* Modals */}
      {isOrderOpen && (
        <CheckoutModal
          isOpen={isOrderOpen}
          onClose={() => setIsOrderOpen(false)}
          beads={beads}
          activeCharm={activeCharm}
          designStats={designStats}
          mainStone={mainStone}
          mainSize={mainSize}
          mainQuality={mainQuality}
          wristMm={wristMm}
          ease={ease}
          packaging={packaging}
          packingCost={packingCost}
          showToast={showToast}
        />
      )}
      {isAdminOpen && <AdminPanelModal onClose={() => setIsAdminOpen(false)} />}
      {isAuthOpen && <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />}
    </>
  );
};
