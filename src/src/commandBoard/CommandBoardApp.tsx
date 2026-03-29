import { useState, useEffect } from 'react';
import { Edit2, Play, Pause, RotateCcw, Shield } from 'lucide-react';

interface LayoutButton {
  actionId: string;
  label: string;
  category: 'primary' | 'quick' | 'extra';
  color: string;
  isActive: boolean;
}

interface MatchEvent {
  id: string;
  action_id: string;
  label: string;
  timestamp_seconds: number;
  part: 1 | 2;
  player_id?: string;
  player_name?: string;
}

interface Match {
  id: string;
  local_name: string;
  visitante_name: string;
  status: 'pre' | 'live' | 'paused' | 'completed';
  local_score: number;
  visitante_score: number;
  local_fouls: number;
  visitante_fouls: number;
}

interface Player {
  id: string;
  name: string;
  onCourt: boolean;
}

interface ConfirmationData {
  minute: string;
  action: string;
  player: string;
  part: string;
}

// BLOQUE 1 - Acciones Principales (3x3) - 9 COLORES ÚNICOS
const PRIMARY_ACTIONS: LayoutButton[] = [
  // Fila 1
  { actionId: "goal", label: "GOL", category: 'primary', color: '#10B981', isActive: true }, // Green
  { actionId: "foul_for", label: "FALTA A FAVOR", category: 'primary', color: '#06B6D4', isActive: true }, // Cyan
  { actionId: "corner_for", label: "CORNER A FAVOR", category: 'primary', color: '#14B8A6', isActive: true }, // Teal
  // Fila 2
  { actionId: "goal_against", label: "GOL CONTRA", category: 'primary', color: '#EF4444', isActive: true }, // Red
  { actionId: "foul_against", label: "FALTA CONTRA", category: 'primary', color: '#F97316', isActive: true }, // Orange
  { actionId: "corner_against", label: "CORNER CONTRA", category: 'primary', color: '#3B82F6', isActive: true }, // Blue
  // Fila 3 - Vacío
  { actionId: "empty_p1", label: "", category: 'primary', color: '', isActive: false },
  { actionId: "empty_p2", label: "", category: 'primary', color: '', isActive: false },
  { actionId: "empty_p3", label: "", category: 'primary', color: '', isActive: false },
];

// BLOQUE 2 - Acciones Rápidas (3x3) - 6 COLORES ÚNICOS
const QUICK_ACTIONS: LayoutButton[] = [
  // Fila 1
  { actionId: "d_ganado", label: "D.GANADO", category: 'quick', color: '#64748B', isActive: true }, // Slate
  { actionId: "b_perdido", label: "B.PERDIDO", category: 'quick', color: '#6B7280', isActive: true }, // Gray
  { actionId: "t_puerta", label: "T.PUERTA", category: 'quick', color: '#71717A', isActive: true }, // Zinc
  // Fila 2
  { actionId: "d_perdido", label: "D.PERDIDO", category: 'quick', color: '#78716C', isActive: true }, // Stone
  { actionId: "b_recuper", label: "B.RECUPER", category: 'quick', color: '#737373', isActive: true }, // Neutral
  { actionId: "t_fuera", label: "T.FUERA", category: 'quick', color: '#52525B', isActive: true }, // Zinc-600
  // Fila 3 - Vacíos
  { actionId: "empty_q1", label: "", category: 'quick', color: '', isActive: false },
  { actionId: "empty_q2", label: "", category: 'quick', color: '', isActive: false },
  { actionId: "empty_q3", label: "", category: 'quick', color: '', isActive: false },
];

// BLOQUE 3 - Acciones Extra (1 fila x 3) - 3 COLORES ÚNICOS
const EXTRA_ACTIONS: LayoutButton[] = [
  { actionId: "penalty_for", label: "PENALTI FAVOR", category: 'extra', color: '#0891B2', isActive: true }, // Cyan-600
  { actionId: "penalty_against", label: "PENALTI CONTRA", category: 'extra', color: '#EA580C', isActive: true }, // Orange-600
  { actionId: "notes", label: "ANOTACIONES", category: 'extra', color: '#CA8A04', isActive: true }, // Yellow-600
];

const INITIAL_PLAYERS: Player[] = [
  { id: '1', name: 'DÍAZ', onCourt: false },
  { id: '2', name: 'LÓPEZ', onCourt: false },
  { id: '3', name: 'GARCÍA', onCourt: false },
  { id: '4', name: 'MARTÍN', onCourt: false },
  { id: '5', name: 'PÉREZ', onCourt: false },
  { id: '6', name: 'SÁNCHEZ', onCourt: false },
  { id: '7', name: 'RUIZ', onCourt: false },
  { id: '8', name: 'JIMÉNEZ', onCourt: false },
  { id: '9', name: 'HERNÁNDEZ', onCourt: false },
  { id: '10', name: 'MORENO', onCourt: false },
  { id: '11', name: 'MUÑOZ', onCourt: false },
  { id: '12', name: 'ÁLVAREZ', onCourt: false },
];

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export default function CommandBoardApp() {
const [currentMatch] = useState<Match>({
    id: generateId(),
    local_name: 'Sant Joan',
    visitante_name: 'Cet10',
    status: 'pre',
    local_score: 0,
    visitante_score: 0,
    local_fouls: 0,
    visitante_fouls: 0,
  });
  
  const [matchStatus, setMatchStatus] = useState<'pre' | 'live' | 'paused'>('pre');
  const [localScore, setLocalScore] = useState(0);
  const [visitanteScore, setVisitanteScore] = useState(0);
  const [localFouls, setLocalFouls] = useState(0);
  const [visitanteFouls, setVisitanteFouls] = useState(0);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [currentPart, setCurrentPart] = useState<1 | 2>(1);
  const [matchTime, setMatchTime] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [primaryActions, setPrimaryActions] = useState<LayoutButton[]>(PRIMARY_ACTIONS);
  const [quickActions, setQuickActions] = useState<LayoutButton[]>(QUICK_ACTIONS);
  const [extraActions, setExtraActions] = useState<LayoutButton[]>(EXTRA_ACTIONS);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  
  // Confirmation panel state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<ConfirmationData | null>(null);

  useEffect(() => {
    let interval: number | undefined;
    
    if (matchStatus === 'live') {
      interval = window.setInterval(() => {
        setMatchTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [matchStatus]);

  // Auto-hide confirmation panel
  useEffect(() => {
    if (showConfirmation) {
      const timeout = window.setTimeout(() => {
        setShowConfirmation(false);
      }, 2000); // 2 seconds
      
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [showConfirmation]);

  const startTimer = () => {
    setMatchStatus('live');
  };

  const pauseTimer = () => {
    setMatchStatus('paused');
  };

  const resetTimer = () => {
    setMatchTime(0);
    setMatchStatus('pre');
  };

  const endMatch = () => {
    if (window.confirm('¿Finalizar partido?')) {
      setMatchStatus('pre');
      setLocalScore(0);
      setVisitanteScore(0);
      setLocalFouls(0);
      setVisitanteFouls(0);
      setEvents([]);
      setMatchTime(0);
      setSelectedPlayerId(null);
    }
  };

  const togglePlayerSelection = (playerId: string) => {
    // Solo un jugador puede estar seleccionado a la vez
    if (selectedPlayerId === playerId) {
      setSelectedPlayerId(null);
    } else {
      setSelectedPlayerId(playerId);
    }
  };

  const addEvent = (actionId: string, label: string) => {
    const selectedPlayer = players.find(p => p.id === selectedPlayerId);
    
    const newEvent: MatchEvent = {
      id: generateId(),
      action_id: actionId,
      label: label,
      timestamp_seconds: matchTime,
      part: currentPart,
      player_id: selectedPlayerId || undefined,
      player_name: selectedPlayer?.name || undefined,
    };

    setEvents(prev => [newEvent, ...prev]);

    // Show confirmation panel
    setConfirmationData({
      minute: formatTime(matchTime),
      action: label,
      player: selectedPlayer?.name || 'Sin jugador',
      part: currentPart === 1 ? '1T' : '2T',
    });
    setShowConfirmation(true);

    // Reset player selection to green (available)
    setSelectedPlayerId(null);

    // Update scores and fouls
    if (actionId === 'goal') {
      setLocalScore(prev => prev + 1);
    } else if (actionId === 'goal_against') {
      setVisitanteScore(prev => prev + 1);
    } else if ((actionId === 'foul_for' || actionId === 'penalty_for') && visitanteFouls < 5) {
      setVisitanteFouls(prev => prev + 1);
    } else if ((actionId === 'foul_against' || actionId === 'penalty_against') && localFouls < 5) {
      setLocalFouls(prev => prev + 1);
    }
  };

  const toggleActionActive = (actionId: string, category: 'primary' | 'quick' | 'extra') => {
    if (category === 'primary') {
      setPrimaryActions(prev => prev.map(b => 
        b.actionId === actionId ? { ...b, isActive: !b.isActive } : b
      ));
    } else if (category === 'quick') {
      setQuickActions(prev => prev.map(b => 
        b.actionId === actionId ? { ...b, isActive: !b.isActive } : b
      ));
    } else {
      setExtraActions(prev => prev.map(b => 
        b.actionId === actionId ? { ...b, isActive: !b.isActive } : b
      ));
    }
  };

  const renderActionButton = (action: LayoutButton) => {
    const isEmpty = !action.label;
    const isInactive = !action.isActive && action.label;
    const showInEditMode = isEditMode || action.isActive;
    
    if (!showInEditMode && !isEmpty) return null;

    return (
      <button
        key={action.actionId}
        onClick={() => {
          if (isEditMode && action.label) {
            toggleActionActive(action.actionId, action.category);
          } else if (!isEditMode && action.isActive) {
            addEvent(action.actionId, action.label);
          }
        }}
        disabled={isEmpty || (!isEditMode && !action.isActive)}
        style={{
          backgroundColor: isEmpty ? 'rgb(51, 65, 85, 0.3)' : (isInactive ? action.color + '40' : action.color),
          opacity: isInactive ? 0.5 : 1,
        }}
        className={`relative h-[90px] rounded-lg transition-all border border-slate-900/30 shadow-md ${
          isEmpty 
            ? 'cursor-default' 
            : 'active:scale-95 hover:opacity-90'
        }`}
      >
        {isEditMode && action.label && action.isActive && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              toggleActionActive(action.actionId, action.category);
            }}
            className="absolute top-1 right-1 bg-slate-900 rounded-full p-0.5 cursor-pointer"
          >
            <span className="text-red-400 text-xs">✕</span>
          </div>
        )}
        {!isEmpty && (
          <div className="flex items-center justify-center h-full px-2">
            <span className="text-xs tracking-wide text-center leading-tight text-white">
              {action.label}
            </span>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 relative">
      <div className="h-full w-full max-w-[1366px] mx-auto">
        
        <div className="grid grid-cols-[1.85fr_1fr] gap-6 h-full">
          
          {/* LEFT COLUMN - 18 SQUARES TOTAL */}
          <div className="flex flex-col gap-3 h-full">
            
            {/* BLOQUE 1 - PRIMARY ACTIONS (3x3) */}
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg border border-slate-700/50 overflow-hidden">
              <div className="bg-yellow-600 px-3 py-1.5">
                <h2 className="text-slate-900 tracking-wide text-xs uppercase">Acciones Principales</h2>
              </div>
              <div className="p-3">
                <div className="grid grid-cols-3 gap-2.5">
                  {primaryActions.map((action) => renderActionButton(action))}
                </div>
              </div>
            </div>

            {/* BLOQUE 2 - QUICK ACTIONS (3x3) */}
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg border border-slate-700/50 overflow-hidden">
              <div className="bg-yellow-600 px-3 py-1.5">
                <h2 className="text-slate-900 tracking-wide text-xs uppercase">Acciones Rápidas</h2>
              </div>
              <div className="p-3">
                <div className="grid grid-cols-3 gap-2.5">
                  {quickActions.map((action) => renderActionButton(action))}
                </div>
              </div>
            </div>

            {/* BLOQUE 3 - EXTRA ACTIONS (1x3) */}
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg border border-slate-700/50 overflow-hidden flex-1">
              <div className="bg-yellow-600 px-3 py-1.5">
                <h2 className="text-slate-900 tracking-wide text-xs uppercase">Acciones Extra</h2>
              </div>
              <div className="p-3">
                <div className="grid grid-cols-3 gap-2.5">
                  {extraActions.map((action) => renderActionButton(action))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-3 h-full">
            
            {/* Match Header with Shields */}
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg border border-slate-700/50 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <Shield className="w-8 h-8 text-yellow-600 flex-shrink-0" />
                <h1 className="text-white text-base tracking-tight text-center flex-1">
                  {currentMatch.local_name} vs {currentMatch.visitante_name}
                </h1>
                <Shield className="w-8 h-8 text-blue-500 flex-shrink-0" />
              </div>
            </div>

            {/* Scoreboard */}
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg border border-slate-700/50 overflow-hidden">
              <div className="bg-yellow-600 px-3 py-1.5 flex items-center justify-between">
                <h2 className="text-slate-900 tracking-wide text-xs uppercase">Marcador</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`p-1.5 rounded transition-all ${
                      isEditMode ? 'bg-blue-600' : 'bg-slate-700/60 hover:bg-slate-600'
                    }`}
                    title="Modo edición"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-white" />
                  </button>
                  <button
                    onClick={endMatch}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-all active:scale-95 tracking-wide text-xs"
                  >
                    FINALIZAR
                  </button>
                </div>
              </div>
              <div className="p-4">
                {/* Timer */}
                <div className="text-center mb-3">
                  <div className="font-mono text-white text-4xl tracking-wider mb-2">
                    {formatTime(matchTime)}
                  </div>
                  
                  {/* Controls */}
                  <div className="flex gap-2 justify-center mb-2">
                    <button
                      onClick={startTimer}
                      disabled={matchStatus === 'live'}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-xs tracking-wide transition-all active:scale-95 flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      D.INICIAR
                    </button>
                    <button
                      onClick={pauseTimer}
                      disabled={matchStatus !== 'live'}
                      className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-xs tracking-wide transition-all active:scale-95 flex items-center gap-1"
                    >
                      <Pause className="w-3 h-3" />
                      PAUSAR
                    </button>
                    <button
                      onClick={resetTimer}
                      className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 rounded text-xs tracking-wide transition-all active:scale-95 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      REINICIAR
                    </button>
                  </div>

                  {/* Part Selector */}
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => setCurrentPart(1)}
                      className={`px-4 py-1 rounded-full text-xs transition-all ${
                        currentPart === 1
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      1T
                    </button>
                    <button
                      onClick={() => setCurrentPart(2)}
                      className={`px-4 py-1 rounded-full text-xs transition-all ${
                        currentPart === 2
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      2T
                    </button>
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-center justify-center gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Local</div>
                    <div className="text-3xl text-white tabular-nums">
                      {localScore}
                    </div>
                  </div>
                  <div className="text-2xl text-slate-600">-</div>
                  <div className="text-center">
                    <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Visitante</div>
                    <div className="text-3xl text-white tabular-nums">
                      {visitanteScore}
                    </div>
                  </div>
                </div>

                {/* Fouls */}
                <div className="border-t border-slate-700/50 pt-3">
                  <div className="text-xs text-slate-400 uppercase tracking-wide mb-2 text-center">Faltas</div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-300 w-16">Local</span>
                    <div className="flex gap-1.5">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={`local-${i}`}
                          className={`w-4 h-4 rounded-full border-2 ${
                            i < localFouls
                              ? 'bg-red-600 border-red-600'
                              : 'border-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 w-16">Visitante</span>
                    <div className="flex gap-1.5">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={`visit-${i}`}
                          className={`w-4 h-4 rounded-full border-2 ${
                            i < visitanteFouls
                              ? 'bg-red-600 border-red-600'
                              : 'border-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Players - Verde=Disponible, Azul=Seleccionado */}
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg border border-slate-700/50 overflow-hidden flex-1">
              <div className="bg-yellow-600 px-3 py-1.5">
                <h2 className="text-slate-900 tracking-wide text-xs uppercase">Jugadores</h2>
              </div>
              <div className="p-3">
                <div className="grid grid-cols-3 gap-2">
                  {players.map((player) => {
                    const isSelected = selectedPlayerId === player.id;
                    return (
                      <button
                        key={player.id}
                        onClick={() => togglePlayerSelection(player.id)}
                        className={`px-2 py-3 rounded-lg transition-all active:scale-95 border-2 ${
                          isSelected
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-green-600 border-green-500 text-white'
                        }`}
                      >
                        <span className="text-xs tracking-wide">
                          {player.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Panel - Rectangular Banner */}
      {showConfirmation && confirmationData && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-800/95 backdrop-blur-md border-2 border-green-500 rounded-lg shadow-2xl px-6 py-3 min-w-[500px] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400 text-xs uppercase tracking-wider">Acción Registrada</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Minuto:</span>
                <span className="text-white font-mono">{confirmationData.minute}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Acción:</span>
                <span className="text-white">{confirmationData.action}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Jugador:</span>
                <span className="text-white">{confirmationData.player}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Parte:</span>
                <span className="text-white">{confirmationData.part}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
