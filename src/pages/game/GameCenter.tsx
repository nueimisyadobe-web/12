import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import type { Membership, VipPlan, Wallet } from '../../lib/types';
import { Card, Button, formatCurrency, EmptyState, PageLoading } from '../../components/ui/Shared';
import { Gamepad2, Play, Clock, Gift, Eye, Trophy, Star, Target, Coins } from 'lucide-react';

type GameState = 'idle' | 'ad_pre' | 'playing' | 'ad_post' | 'reward';

export default function GameCenter() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [plan, setPlan] = useState<VipPlan | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [adTimer, setAdTimer] = useState(0);
  const [gameLevel, setGameLevel] = useState(1);
  const [gameScore, setGameScore] = useState(0);
  const [targetScore, setTargetScore] = useState(0);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [adDuration, setAdDuration] = useState(10);

  useEffect(() => {
    if (!profile) return;
    const fetchData = async () => {
      const [memRes, walletRes, settingsRes] = await Promise.all([
        supabase.from('memberships').select('*, plan:vip_plans(*)').eq('user_id', profile.id).eq('status', 'active').order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('wallets').select('*').eq('user_id', profile.id).maybeSingle(),
        supabase.from('admin_settings').select('value').eq('key', 'ad_duration_seconds').maybeSingle(),
      ]);

      if (memRes.data) {
        setMembership(memRes.data);
        if (memRes.data.plan) setPlan(memRes.data.plan as unknown as VipPlan);

        // Check if daily reset needed
        const today = new Date().toISOString().split('T')[0];
        if (memRes.data.last_reset_date !== today) {
          await supabase.from('memberships').update({
            daily_attempts_used: 0,
            daily_rewards_earned: 0,
            last_reset_date: today,
          }).eq('id', memRes.data.id);
          setMembership({ ...memRes.data, daily_attempts_used: 0, daily_rewards_earned: 0, last_reset_date: today });
        }
      }
      if (walletRes.data) setWallet(walletRes.data);
      if (settingsRes.data) setAdDuration(parseInt(settingsRes.data.value) || 10);
      setLoading(false);
    };
    fetchData();
  }, [profile]);

  const canPlay = !!(membership && plan && membership.daily_attempts_used < plan.daily_attempts);
  const dailyCapReached = !!(membership && plan && Number(membership.daily_rewards_earned) >= Number(plan.daily_reward_cap));

  const startGame = useCallback(() => {
    if (!canPlay || dailyCapReached) {
      showToast('error', dailyCapReached ? 'تم الوصول للحد اليومي للمكافآت' : 'لا توجد محاولات متبقية اليوم');
      return;
    }
    setGameState('ad_pre');
    setAdTimer(adDuration);
    setGameScore(0);
    setTargetScore(Math.floor(Math.random() * 5) + 3);
  }, [canPlay, dailyCapReached, adDuration, showToast]);

  // Ad timer effect
  useEffect(() => {
    if ((gameState === 'ad_pre' || gameState === 'ad_post') && adTimer > 0) {
      const timer = setTimeout(() => setAdTimer(adTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'ad_pre' && adTimer === 0) {
      setGameState('playing');
    } else if (gameState === 'ad_post' && adTimer === 0) {
      finishGame();
    }
  }, [adTimer, gameState]);

  const handleGameClick = () => {
    if (gameState !== 'playing') return;
    const newScore = gameScore + 1;
    setGameScore(newScore);
    if (newScore >= targetScore) {
      setGameState('ad_post');
      setAdTimer(adDuration);
    }
  };

  const finishGame = async () => {
    if (!profile || !membership || !plan) return;

    const reward = Number(plan.reward_per_game);
    setRewardAmount(reward);
    setGameState('reward');

    // Record game session
    const { data: sessionData } = await supabase.from('game_sessions').insert({
      user_id: profile.id,
      membership_id: membership.id,
      level_played: gameLevel,
      reward_earned: reward,
      ad_watched: true,
      ad_duration_seconds: adDuration,
    }).select().single();

    // Record reward
    if (sessionData) {
      await supabase.from('rewards').insert({
        user_id: profile.id,
        game_session_id: sessionData.id,
        amount: reward,
        reward_type: 'game',
      });
    }

    // Update wallet
    await supabase.from('wallets').update({
      rewards_balance: Number(wallet?.rewards_balance ?? 0) + reward,
      total_rewards_earned: Number(wallet?.total_rewards_earned ?? 0) + reward,
    }).eq('user_id', profile.id);

    // Update membership
    await supabase.from('memberships').update({
      daily_attempts_used: membership.daily_attempts_used + 1,
      daily_rewards_earned: Number(membership.daily_rewards_earned) + reward,
    }).eq('id', membership.id);

    // Record transaction
    await supabase.from('transactions').insert({
      user_id: profile.id,
      type: 'reward',
      amount: reward,
      status: 'completed',
      reference_id: sessionData?.id,
      reference_type: 'game_session',
      description: `Game Level ${gameLevel} reward`,
    });

    // Update local state
    setWallet(prev => prev ? {
      ...prev,
      rewards_balance: Number(prev.rewards_balance) + reward,
      total_rewards_earned: Number(prev.total_rewards_earned) + reward,
    } : prev);

    setMembership(prev => prev ? {
      ...prev,
      daily_attempts_used: prev.daily_attempts_used + 1,
      daily_rewards_earned: Number(prev.daily_rewards_earned) + reward,
    } : prev);

    setGameLevel(prev => prev + 1);
    showToast('success', `كسبت ${formatCurrency(reward)}!`);
  };

  const resetGame = () => {
    setGameState('idle');
    setGameScore(0);
  };

  if (loading) {
    return <PageLoading />;
  }

  if (!membership || !plan) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0 animate-stagger">
        <h1 className="text-2xl font-bold">مركز الألعاب</h1>
        <EmptyState
          icon={Gamepad2}
          title="لا توجد عضوية نشطة"
          description="تحتاج إلى عضوية VIP نشطة للعب الألعاب وكسب المكافآت. اختر خطة للبدء."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0 animate-stagger">
      <div>
        <h1 className="text-2xl font-bold mb-1">مركز الألعاب</h1>
        <p className="text-sm text-gray-400">العب ألعاباً يومية واكسب مكافآت</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="text-center py-4 card-glow">
          <Gamepad2 className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <p className="text-lg font-bold">{membership.daily_attempts_used}/{plan.daily_attempts}</p>
          <p className="text-xs text-gray-500">المحاولات المستخدمة</p>
        </Card>
        <Card className="text-center py-4">
          <Gift className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <p className="text-lg font-bold">{formatCurrency(membership.daily_rewards_earned)}</p>
          <p className="text-xs text-gray-500">مكافآت اليوم</p>
        </Card>
        <Card className="text-center py-4">
          <Trophy className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <p className="text-lg font-bold">{formatCurrency(plan.daily_reward_cap)}</p>
          <p className="text-xs text-gray-500">الحد اليومي</p>
        </Card>
        <Card className="text-center py-4">
          <Coins className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <p className="text-lg font-bold">{formatCurrency(plan.reward_per_game)}</p>
          <p className="text-xs text-gray-500">لكل لعبة</p>
        </Card>
      </div>

      {/* Game Area */}
      <Card className="min-h-[400px] flex flex-col items-center justify-center card-glow">
        {gameState === 'idle' && (
          <div className="text-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500/20 to-blue-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
              <Gamepad2 className="w-12 h-12 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">مستعد للعب؟</h2>
            <p className="text-sm text-gray-400 mb-6">
              {canPlay
                ? `${plan.daily_attempts - membership.daily_attempts_used} محاولات متبقية اليوم`
                : dailyCapReached ? 'تم الوصول للحد اليومي للمكافآت' : 'لا توجد محاولات متبقية اليوم'}
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={startGame}
              disabled={!canPlay || dailyCapReached}
            >
              <Play className="w-5 h-5" />
              ابدأ اللعب
            </Button>
          </div>
        )}

        {gameState === 'ad_pre' && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Eye className="w-10 h-10 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">شاهد الإعلان</h2>
            <p className="text-sm text-gray-400 mb-4">يرجى مشاهدة هذا الإعلان قبل اللعب</p>
            <div className="w-16 h-16 rounded-full bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-blue-400">{adTimer}</span>
            </div>
            <p className="text-xs text-gray-600 mt-3">جاري عرض الإعلان...</p>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="text-center w-full">
            <h2 className="text-xl font-bold mb-2">المستوى {gameLevel}</h2>
            <p className="text-sm text-gray-400 mb-6">اضغط على الهدف {targetScore} مرات للفوز!</p>

            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">النتيجة</p>
                <p className="text-3xl font-bold text-amber-400">{gameScore}/{targetScore}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-64 mx-auto h-3 bg-white/5 rounded-full overflow-hidden mb-8">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-200"
                style={{ width: `${(gameScore / targetScore) * 100}%` }}
              />
            </div>

            <button
              onClick={handleGameClick}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/30 hover:from-amber-400 hover:to-amber-500 active:scale-95 transition-all"
            >
              <Target className="w-16 h-16 text-black" />
            </button>
          </div>
        )}

        {gameState === 'ad_post' && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Eye className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">شاهد الإعلان للحصول على المكافأة</h2>
            <p className="text-sm text-gray-400 mb-4">اقتربت! شاهد هذا الإعلان للحصول على مكافأتك</p>
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-emerald-400">{adTimer}</span>
            </div>
          </div>
        )}

        {gameState === 'reward' && (
          <div className="text-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500/20 to-emerald-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Star className="w-12 h-12 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">حصلت على مكافأة!</h2>
            <p className="text-4xl font-extrabold text-amber-400 mb-2">{formatCurrency(rewardAmount)}</p>
            <p className="text-sm text-gray-400 mb-6">المستوى {gameLevel - 1} مكتمل</p>

            <div className="flex items-center justify-center gap-3">
              <Button variant="primary" onClick={startGame} disabled={!canPlay && !dailyCapReached} className="active:scale-[0.98]">
                <Play className="w-4 h-4" />
                العب مرة أخرى
              </Button>
              <Button variant="secondary" onClick={resetGame}>
                رجوع
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Daily Cap Warning */}
      {dailyCapReached && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 text-center">
          <Clock className="w-5 h-5 text-amber-400 mx-auto mb-2" />
          <p className="text-sm text-amber-400 font-medium">تم الوصول للحد اليومي للمكافآت</p>
          <p className="text-xs text-gray-500">عد غداً لمزيد من المكافآت</p>
        </div>
      )}
    </div>
  );
}
