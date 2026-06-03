-- ============================================================
-- RPCs app — SECURITY DEFINER
-- Requer usuario autenticado: auth.uid() deve corresponder a p_user_id.
-- GRANT apenas para `authenticated` (nunca `anon`).
-- ============================================================

-- -------------------------------------------------------
-- app_demo_checkin
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION app_demo_checkin(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today date := current_date;
  v_last  date;
  v_streak int;
  v_xp    int;
  v_coins int;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  SELECT last_checkin_at, streak, xp, coins
    INTO v_last, v_streak, v_xp, v_coins
    FROM users WHERE id = p_user_id FOR UPDATE;

  IF v_last = v_today THEN
    RETURN jsonb_build_object('already', true, 'streak', v_streak, 'new_xp', v_xp, 'new_coins', v_coins);
  END IF;

  v_streak := CASE WHEN v_last = v_today - 1 THEN v_streak + 1 ELSE 1 END;
  v_xp     := v_xp + 50;
  v_coins  := v_coins + 100;

  UPDATE users
     SET last_checkin_at = v_today, streak = v_streak, xp = v_xp, coins = v_coins
   WHERE id = p_user_id;

  RETURN jsonb_build_object('already', false, 'streak', v_streak, 'new_xp', v_xp, 'new_coins', v_coins);
END;
$$;

GRANT EXECUTE ON FUNCTION app_demo_checkin(uuid) TO authenticated;

-- -------------------------------------------------------
-- app_demo_toggle_like
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION app_demo_toggle_like(p_user_id uuid, p_post_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_liked bool;
  v_likes int;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  IF EXISTS (SELECT 1 FROM post_likes WHERE user_id = p_user_id AND post_id = p_post_id) THEN
    DELETE FROM post_likes WHERE user_id = p_user_id AND post_id = p_post_id;
    UPDATE feed_posts SET likes = GREATEST(0, likes - 1) WHERE id = p_post_id;
    v_liked := false;
  ELSE
    INSERT INTO post_likes (user_id, post_id) VALUES (p_user_id, p_post_id) ON CONFLICT DO NOTHING;
    UPDATE feed_posts SET likes = likes + 1 WHERE id = p_post_id;
    v_liked := true;
  END IF;

  SELECT likes INTO v_likes FROM feed_posts WHERE id = p_post_id;
  RETURN jsonb_build_object('liked', v_liked, 'likes', COALESCE(v_likes, 0));
END;
$$;

GRANT EXECUTE ON FUNCTION app_demo_toggle_like(uuid, uuid) TO authenticated;

-- -------------------------------------------------------
-- app_demo_follow_toggle
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION app_demo_follow_toggle(p_user_id uuid, p_target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_following bool;
  v_followers int;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  IF p_user_id = p_target_user_id THEN
    RAISE EXCEPTION 'cannot follow yourself';
  END IF;

  IF EXISTS (SELECT 1 FROM follows WHERE follower_id = p_user_id AND following_id = p_target_user_id) THEN
    DELETE FROM follows WHERE follower_id = p_user_id AND following_id = p_target_user_id;
    UPDATE tipsters SET followers = GREATEST(0, followers - 1) WHERE user_id = p_target_user_id;
    v_following := false;
  ELSE
    INSERT INTO follows (follower_id, following_id) VALUES (p_user_id, p_target_user_id) ON CONFLICT DO NOTHING;
    UPDATE tipsters SET followers = followers + 1 WHERE user_id = p_target_user_id;
    v_following := true;
  END IF;

  SELECT followers INTO v_followers FROM tipsters WHERE user_id = p_target_user_id;
  RETURN jsonb_build_object('following', v_following, 'followers', COALESCE(v_followers, 0));
END;
$$;

GRANT EXECUTE ON FUNCTION app_demo_follow_toggle(uuid, uuid) TO authenticated;

-- -------------------------------------------------------
-- app_demo_award_progress
-- Delega para fn_award_mission_progress existente.
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION app_demo_award_progress(p_user_id uuid, p_action_key text, p_count int DEFAULT 1)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated int;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  SELECT fn_award_mission_progress(p_user_id, p_action_key, p_count) INTO v_updated;
  RETURN COALESCE(v_updated, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION app_demo_award_progress(uuid, text, int) TO authenticated;

-- -------------------------------------------------------
-- app_demo_place_bet
-- Delega para fn_place_bet existente (KYC + saldo + limites).
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION app_demo_place_bet(
  p_user_id  uuid,
  p_match_id uuid,
  p_side     text,
  p_stake    numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bet_id  uuid;
  v_balance numeric;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  SELECT fn_place_bet(p_user_id, p_match_id, p_side, p_stake) INTO v_bet_id;
  SELECT balance INTO v_balance FROM wallets WHERE user_id = p_user_id;

  RETURN jsonb_build_object('bet_id', v_bet_id, 'new_balance', COALESCE(v_balance, 0));
END;
$$;

GRANT EXECUTE ON FUNCTION app_demo_place_bet(uuid, uuid, text, numeric) TO authenticated;
