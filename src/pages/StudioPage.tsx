import React, { useState, useMemo, useEffect, lazy } from 'react';
import { useStudioStore } from '../store/useStudioStore';
import { useCatalogStore } from '../store/useCatalogStore';
import { useDesignStore } from '../store/useDesignStore';
/* Only the icons this file actually renders. The previous list imported 35 and
   used 5; the rest were dead weight in the lucide chunk. */
import { Sparkles, LogOut, User, Check } from 'lucide-react';
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
import { calculateBraceletFit, clampWristMm } from '../braceletFit';
import { calculateBasePrice } from '../pricing';
import { calculateBlueprintMetrics, calculateBeadCountForCircumference, calculateInnerFit } from '../geometry';
import { injectFocalWord, addBeadSymmetrically, removeBeadSymmetrically } from '../symmetry';
import { useAuthStore } from "../store/useAuthStore";
import { useCartStore } from "../store/useCartStore";
import { useSavedDesignsStore } from "../store/useSavedDesignsStore";
import { AuthModal } from "../components/AuthModal";
import { SafeSection, ErrorBoundary } from "../components/ErrorBoundary";
import { Button, IconButton } from "../components/ui";

// NOTE: these are deliberately bare `lazy()` calls, NOT wrapped in
// `(props: any) => ...`. That wrapper erased every prop contract in this file
// and is why missing required props reached the browser as blank screens
// instead of failing `tsc`. Suspense + error handling now live in <SafeSection>.
const Bracelet3D = lazy(() => import('../components/Bracelet3D').then(m => ({ default: m.Bracelet3D })));
const Blueprint2D = lazy(() => import('../components/Blueprint2D').then(m => ({ default: m.Blueprint2D })));
const ExpertAssessment = lazy(() => import('../components/ExpertAssessment').then(m => ({ default: m.ExpertAssessment })));
const AdminPanelModal = lazy(() => import('../components/AdminPanelModal').then(m => ({ default: m.AdminPanelModal })));
const FitCalibrationPanel = lazy(() => import('../components/FitCalibrationPanel').then(m => ({ default: m.FitCalibrationPanel })));
const LetterBeadSequencer = lazy(() => import('../components/LetterBeadSequencer').then(m => ({ default: m.LetterBeadSequencer })));
const SequenceEditorPanel = lazy(() => import('../components/SequenceEditorPanel').then(m => ({ default: m.SequenceEditorPanel })));
const GemstoneSelectorPanel = lazy(() => import('../components/GemstoneSelectorPanel').then(m => ({ default: m.GemstoneSelectorPanel })));
const CheckoutModal = lazy(() => import('../components/CheckoutModal').then(m => ({ default: m.CheckoutModal })));



export default function StudioPage() {
  // --- STATE ---
  const { user, checkSession, logout } = useAuthStore();
  const { fetchCart } = useCartStore();
  /* `isAuthModalOpen` used to be declared here alongside `isAuthOpen` below;
     only the latter was ever read or written. */
  const { fetchDesigns } = useSavedDesignsStore();

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

  /* The wrist field and its clamp live in FitCalibrationPanel; this page only
     needs the shared bounds when normalising an out-of-range stored value. */
  useEffect(() => {
    const clamped = clampWristMm(wristMm);
    if (clamped !== wristMm) setWristMm(clamped);
  }, [wristMm, setWristMm]);

  const currencyFmt = useMemo(
    () => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }),
    []
  );

  const fitTone =
    designStats.status === 'perfect' ? 'success' : designStats.status === 'tight' ? 'danger' : 'warning';
  const fitLabel =
    designStats.status === 'perfect'
      ? 'Optimal fit'
      : designStats.status === 'tight'
        ? 'Runs tight'
        : 'Runs loose';

  return (
    <>
      {/* Toast — polite live region so the message is announced, not just seen.
          Previously a bare div with no role, invisible to screen readers. */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-6 left-1/2 z-[120] -translate-x-1/2"
      >
        {toastMsg && (
          <div className="ab-rise flex items-center gap-2 rounded-full border border-white/10 bg-[var(--color-obsidian-950)] px-4 py-2.5 text-[13px] font-medium text-[var(--color-text-onDark)] shadow-[var(--shadow-e4)]">
            <Check className="h-4 w-4 text-[var(--color-gold-400)]" />
            {toastMsg}
          </div>
        )}
      </div>

      {/* Skip link — first tab stop, previously absent.
          Uses a dedicated class rather than `focus:not-sr-only`, which is
          Tailwind's counterpart to its own `sr-only` and does not unwind the
          clip/1px sizing applied by `.sr-only-x`. */}
      <a href="#studio-preview" className="skip-link">
        Skip to preview
      </a>

      <div className="relative z-10 min-h-screen">
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                           */}
        {/* ---------------------------------------------------------------- */}
        <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[color-mix(in_srgb,var(--color-obsidian-50)_82%,transparent)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-serif text-[21px] font-semibold leading-none tracking-tight text-[var(--theme-primary)]">
                Artisan Beadfit
              </h1>
              <p className="label-micro mt-1 hidden sm:block">Bespoke gemstone studio</p>
            </div>

            {/* Running total. A configurator that hides its price until the
                checkout modal makes people guess; this keeps it in view. */}
            <div className="hidden items-baseline gap-2 rounded-full border border-[var(--color-line)] bg-white/60 px-4 py-2 md:flex">
              <span className="label-micro">Est.</span>
              <span className="numeral text-[16px] font-semibold leading-none text-[var(--theme-primary)]">
                {currencyFmt.format(designStats.price)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="primary" size="md" onClick={() => setIsOrderOpen(true)}>
                Review design
              </Button>
              <IconButton label="Studio terminal" onClick={() => setIsAdminOpen(true)}>
                <Sparkles className="h-[18px] w-[18px]" />
              </IconButton>
              {user ? (
                <IconButton label={`Sign out (${user.email ?? 'account'})`} onClick={logout}>
                  <LogOut className="h-[18px] w-[18px]" />
                </IconButton>
              ) : (
                <IconButton label="Sign in" onClick={() => setIsAuthOpen(true)}>
                  <User className="h-[18px] w-[18px]" />
                </IconButton>
              )}
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1600px] px-4 pb-24 pt-6 sm:px-6 lg:px-8">

      {/* Main Studio Grid.
          Controls scroll on the left; the preview is sticky on the right so the
          object being configured stays in view. Previously both columns scrolled
          together and the 3D stage — the whole point of the page — left the
          viewport as soon as you reached the spacer controls. */}
      <div className="relative grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Left Column: Gemstone & Styling Controls */}
        {/* order-2 on small screens puts the preview above the controls, so a
            phone user sees the piece before the configuration; on lg the
            columns take their natural left/right positions. */}
        <div className="order-2 space-y-4 lg:order-1 lg:col-span-5">
          <SafeSection label="Gemstone selector">
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
          </SafeSection>
          <SafeSection label="Fit calibration">
          <FitCalibrationPanel
            unit={unit}
            setUnit={setUnit}
            wristMm={wristMm}
            setWristMm={setWristMm}
            ease={ease}
            setEase={setEase}
            showToast={showToast}
          />
          </SafeSection>
          <SafeSection label="Letter bead sequencer">
          <LetterBeadSequencer
            customWord={customWord}
            setCustomWord={setCustomWord}
            letterStyle={letterStyle}
            setLetterStyle={setLetterStyle}
          />
          </SafeSection>
          <SafeSection label="Sequence editor">
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
          </SafeSection>
        </div>

        {/* Right Column: the piece itself, pinned while the controls scroll */}
        <div
          id="studio-preview"
          className="order-1 lg:order-2 lg:sticky lg:top-[76px] lg:col-span-7"
        >
          <div className="panel overflow-hidden p-0">
            <div className="h-[52vh] min-h-[340px] bg-[var(--color-surface-sunken)] lg:h-[calc(100vh-13rem)]">
              <SafeSection label="3D preview">
                <Bracelet3D
                  beads={beads}
                  activeCharm={activeCharm}
                  selectedBeadIndex={selectedBeadIndex}
                  setSelectedBeadIndex={setSelectedBeadIndex}
                  blueprintRadius={(wristMm + ease) / (2 * Math.PI) / 10}
                  wristMm={wristMm}
                  ease={ease}
                />
              </SafeSection>
            </div>

            {/* Live spec strip: the numbers that decide whether this bracelet
                actually fits, kept next to the object rather than buried in a
                panel further down the page. */}
            <div className="grid grid-cols-3 divide-x divide-[var(--color-line)] border-t border-[var(--color-line)] bg-white/60">
              {[
                { k: 'Beads', v: String(beads.length) },
                { k: 'Inner fit', v: `${designStats.innerFit.toFixed(1)}mm` },
                { k: 'Target', v: `${designStats.target}mm` },
              ].map((s) => (
                <div key={s.k} className="px-4 py-3 text-center">
                  <span className="label-micro block">{s.k}</span>
                  <span className="numeral mt-0.5 block text-[15px] font-semibold text-[var(--color-text-primary)]">
                    {s.v}
                  </span>
                </div>
              ))}
            </div>

            <div
              className={`flex items-center justify-center gap-2 border-t px-4 py-2.5 text-[12px] font-semibold ${
                fitTone === 'success'
                  ? 'border-[color-mix(in_srgb,var(--color-success-fg)_20%,transparent)] bg-[var(--color-success-bg)] text-[var(--color-success-fg)]'
                  : fitTone === 'danger'
                    ? 'border-[color-mix(in_srgb,var(--color-danger-fg)_20%,transparent)] bg-[var(--color-danger-bg)] text-[var(--color-danger-fg)]'
                    : 'border-[color-mix(in_srgb,var(--color-warning-fg)_20%,transparent)] bg-[var(--color-warning-bg)] text-[var(--color-warning-fg)]'
              }`}
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-current"
              />
              {fitLabel}
              <span className="numeral font-normal opacity-75">
                ({designStats.discrepancy > 0 ? '+' : ''}
                {designStats.discrepancy.toFixed(1)}mm)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Analysis                                                            */}
      {/* ------------------------------------------------------------------ */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SafeSection label="2D blueprint">
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
        </SafeSection>
        <SafeSection label="Expert assessment">
          <ExpertAssessment expertAnalysis={expertAnalysis} />
        </SafeSection>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Archives                                                            */}
      {/* ------------------------------------------------------------------ */}
      <section className="mt-6">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <div>
            <h2 className="font-serif text-[24px] font-semibold leading-tight tracking-tight text-[var(--color-text-primary)]">
              Masterpiece archives
            </h2>
            <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
              Start from a studio composition, then make it yours.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {DESIGN_PRESETS.map((p) => {
            const firstStone = catalog.find((i) => i.name === p.pattern[0]);
            const secStone = catalog.find((i) => i.name === p.pattern[1]);
            if (!firstStone || !secStone) return null;
            return (
              <button
                key={p.name}
                onClick={() => applyPreset(p)}
                className="panel u-interactive u-press group p-4 text-left hover:border-[var(--color-gold-400)] hover:shadow-[var(--shadow-e3)]"
              >
                {/* Overlapping swatches read as a physical strand rather than
                    two unrelated dots. */}
                <span aria-hidden="true" className="mb-3 flex">
                  <span
                    className="h-6 w-6 rounded-full shadow-inner ring-2 ring-white"
                    style={{ backgroundColor: firstStone.hex }}
                  />
                  <span
                    className="-ml-2 h-6 w-6 rounded-full shadow-inner ring-2 ring-white"
                    style={{ backgroundColor: secStone.hex }}
                  />
                </span>
                <span className="block font-serif text-[15px] font-semibold leading-tight text-[var(--color-text-primary)]">
                  {p.name}
                </span>
                <span className="mt-1 block text-[11px] leading-snug text-[var(--color-text-muted)]">
                  {p.sub}
                </span>
              </button>
            );
          })}
        </div>
      </section>
        </div>
      </div>

      {/* Modals */}
      {isOrderOpen && (
        <SafeSection label="Checkout" compact>
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
        </SafeSection>
      )}
      {isAdminOpen && (
        <SafeSection label="Admin panel" compact>
          <AdminPanelModal
            isOpen={isAdminOpen}
            onClose={() => setIsAdminOpen(false)}
            markup={markup}
            setMarkup={setMarkup}
            laborCost={laborCost}
            setLaborCost={setLaborCost}
            packingCost={packingCost}
            setPackingCost={setPackingCost}
            catalog={catalog}
            showToast={showToast}
          />
        </SafeSection>
      )}
      {isAuthOpen && (
        <ErrorBoundary label="Sign in" compact>
          <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </ErrorBoundary>
      )}
    </>
  );
};
