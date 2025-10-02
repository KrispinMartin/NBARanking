install.packages("hoopR")
install.packages("devtools")
install.packages("moments")
devtools::install_github("sportsdataverse/hoopR")
devtools::install_github("abresler/nbastatR",force = TRUE)

library("devtools")
library(hoopR)
library(dplyr)
library(ggplot2)
library(tidyr)
library(skimr)
library(janitor)
library(nbastatR)
library(stringr)
library(dplyr)
library(ggplot2)
library(moments)
library(knitr)
library(rvest)

ls("package:hoopR")
ls("package:nbastatR")

# -------------------------------
# Step 1: NBA Player IDs + Names
# -------------------------------
all_players <- nba_commonallplayers(is_only_current_season = 1, league_id = "00")

nba_ids <- all_players$CommonAllPlayers %>%
  transmute(
    Person_ID = as.character(PERSON_ID),
    nba_name  = DISPLAY_FIRST_LAST
  )

cat("NBA Players retrieved:", nrow(nba_ids), "\n")

# -------------------------------
# Step 2: Scrape ESPN Players (IDs + Names)
# -------------------------------
team_abbs <- c('atl','bkn','bos','cha','cle','chi','dal','den','det','gsw','hou',
               'ind','lac','lal','mem','mia','mil','min','no','ny','okc','orl',
               'phi','phx','por','sa','sac','tor','utah','wsh')

season <- format(Sys.Date(), "%Y")   
urls <- paste0("https://www.espn.com/nba/team/stats/_/name/", team_abbs,
               "/season/", season, "/seasontype/2")
espn_links_all <- lapply(urls, function(u) {
  webpage <- tryCatch(read_html(u), error = function(e) return(NULL))
  if (is.null(webpage)) return(NULL)
  
  links <- webpage %>% html_nodes(xpath = "//td/span/a") %>% html_attr("href")
  names <- webpage %>% html_nodes(xpath = "//td/span/a") %>% html_text()
  
  data.frame(
    espn_name = names,
    espn_link = links,
    stringsAsFactors = FALSE
  )
})


# LONG TIME TO LOAD
espn_links_all <- do.call(rbind, espn_links_all) %>%
  distinct(espn_link, .keep_all = TRUE) %>%
  mutate(
    athlete_id = str_extract(espn_link, "(?<=/id/)[0-9]+")
  )


cat("ESPN Players scraped:", nrow(espn_links_all), "\n")

# -------------------------------
# Step 3: Exact Join (NBA ↔ ESPN by Name)
# -------------------------------
merged_exact <- nba_ids %>%
  left_join(espn_links_all, by = c("nba_name" = "espn_name"))

cat("Exact matches:", sum(!is.na(merged_exact$athlete_id)), "\n")

# -------------------------------
# Step 4: Fetch ESPN Player Stats for 2025
# -------------------------------
recent_season = most_recent_nba_season()

# LONG TIME TO LOAD
player_stats_list <- lapply(merged_exact$athlete_id, function(id) {
  tryCatch({
    espn_nba_player_stats(athlete_id = id, recent_season)
  }, error = function(e) {
    message(paste("No data for athlete_id:", id))
    NULL
  })
})

print(recent_season)
print(class(recent_season))
# Combine All Stats into One DataFrame
all_stats <- bind_rows(player_stats_list)

all_stats
View(all_stats)
# -------------------------------
# Preview Results
# -------------------------------
head(all_stats)
dim(all_stats)

write.csv(all_stats, "nba_all_stats.csv")

# -------------------------------
# Filtering Rotation-Level Players
# -------------------------------

all_stats_clean <- all_stats %>%
  filter(general_minutes > 500 & general_games_played >10) 

View(all_stats_clean)
# -------------------------------
# RANKING
# -------------------------------

# Safe z-score helper
z <- function(x) {
  s <- suppressWarnings(sd(x, na.rm = TRUE))
  if (is.na(s) || s == 0) rep(0, length(x)) else as.numeric(scale(x))
}

# Weighted ranking
rank_players <- function(tbl,
                         # category weights (must sum ~1; we’ll normalize just in case)
                         w_cat = c(impact = 0.15, scoring = 0.23, play = 0.15,
                                   reb = 0.16, disc = 0.12, def = 0.19),
                         # defence internal weights: steals vs blocks
                         w_def = c(stl = 0.6, blk = 0.4)) {
  # normalize weights to be safe
  w_cat <- w_cat / sum(w_cat, na.rm = TRUE)
  w_def <- w_def / sum(w_def, na.rm = TRUE)
  tbl %>%
    # Pick 3 per section (as you specified)
    mutate(
      ## Impact
      impact_per        = general_per,
      impact_plusminus  = general_plus_minus,
      ## Scoring
      scoring_3p_pct    = offensive_three_point_pct,
      scoring_2p_pct    = offensive_two_point_field_goal_pct,
      scoring_points    = offensive_points,
      true_shoot        = offensive_true_shooting_pct,
      ## Playmaking
      play_ast          = offensive_assists,
      play_ast48        = offensive_avg48assists,
      
      ## Rebounding
      reb_off48         = offensive_avg48offensive_rebounds,
      reb_def48         = defensive_avg48defensive_rebounds,
      reb_def_rate      = defensive_def_rebound_rate,
      reb_off_rate      = offensive_off_rebound_rate, 
      ## Discipline (penalties)
      disc_fouls48      = general_avg48fouls,
      disc_turnovers    = offensive_turnovers,
      disc_tov_rate     = offensive_turnover_ratio,
      ## Defence
      def_blk48         = defensive_avg48blocks,
      def_stl48         = defensive_avg48steals
    ) %>%
    # Z-scores per stat
    mutate(
      Z_IMPACT  = rowMeans(cbind(z(impact_per), z(impact_plusminus)), na.rm = TRUE),
      Z_SCORING = rowMeans(cbind(z(scoring_3p_pct), z(scoring_2p_pct), z(scoring_points), z(true_shoot)), na.rm = TRUE),
      Z_PLAY    = rowMeans(cbind(z(play_ast), z(play_ast48)), na.rm = TRUE),
      Z_REB     = rowMeans(cbind(z(reb_off48), z(reb_def48), z(reb_def_rate), z(reb_off_rate)), na.rm = TRUE),
      Z_DISC    = rowMeans(cbind(-z(disc_fouls48), -z(disc_turnovers), -z(disc_tov_rate)), na.rm = TRUE), # lower is better
      Z_DEF     = w_def["stl"] * z(def_stl48) + w_def["blk"] * z(def_blk48)
    ) %>%
    # Weighted category blend
    mutate(
      score_total = w_cat["impact"] * Z_IMPACT +
        w_cat["scoring"] * Z_SCORING +
        w_cat["play"]   * Z_PLAY +
        w_cat["reb"]    * Z_REB +
        w_cat["disc"]   * Z_DISC +
        w_cat["def"]    * Z_DEF
    ) %>%
    arrange(desc(score_total)) %>%
    mutate(rank = row_number(),
           namePlayer = coalesce(full_name, display_name, short_name, slug)) %>%
    select(rank, namePlayer, score_total,position_abbreviation, team_abbreviation,
           Z_IMPACT, Z_SCORING, Z_PLAY, Z_REB, Z_DISC, Z_DEF)
}

# Run
res <- rank_players(all_stats_clean)
View(res)

#Normalize the scores to 0-100
scale_logistic <- function(x, lower = 30, upper = 99) {
  z <- scale(x)[,1]
  p <- 1 / (1 + exp(-z))              # logistic in (0,1)
  scaled <- p * (upper - lower) + lower
  return(scaled)
}

res <- res %>%
  mutate(
    IMPACT_100  = scale_logistic(Z_IMPACT),
    SCORING_100 = scale_logistic(Z_SCORING),
    PLAY_100    = scale_logistic(Z_PLAY),
    REB_100     = scale_logistic(Z_REB),
    DISC_100    = scale_logistic(Z_DISC),
    DEF_100     = scale_logistic(Z_DEF),
    TOTAL_100   = scale_logistic(score_total)
  ) %>%
  select(rank, namePlayer, position_abbreviation, team_abbreviation, TOTAL_100)

#Hot and Cold Streak
library(nbastatR)
ls("package:nbastatR")

library(dplyr)
library(zoo)

# ---------------------------------------------------------
# 1. Pull game logs (player-level, all games in 2025 season)
# ---------------------------------------------------------
Sys.setenv("VROOM_CONNECTION_SIZE" = 10 * 1024 * 1024)

logs <- game_logs(seasons = recent_season, league = "NBA",
                  season_types = c("Regular Season", "Playoffs"))
glimpse(logs)
colnames(logs)

# ---------------------------------------------------------
# 2. Add per-game ranking score (TOTAL_100)
# ---------------------------------------------------------
logs_with_score <- logs %>%
  mutate(
    # --- Derived per-minute stats ---
    ast48   = ifelse(minutes > 0, ast / minutes * 48, NA_real_),
    oreb48  = ifelse(minutes > 0, oreb / minutes * 48, NA_real_),
    dreb48  = ifelse(minutes > 0, dreb / minutes * 48, NA_real_),
    stl48   = ifelse(minutes > 0, stl / minutes * 48, NA_real_),
    blk48   = ifelse(minutes > 0, blk / minutes * 48, NA_real_),
    fouls48 = ifelse(minutes > 0, pf  / minutes * 48, NA_real_)
  ) %>%
  mutate(
    # --- Z-scores per category ---
    Z_IMPACT  = z(plusminus),   # no PER in logs
    Z_SCORING = rowMeans(cbind(z(pctFG3), z(pctFG2), z(pts), z(pctFG)), na.rm = TRUE),
    Z_PLAY    = rowMeans(cbind(z(ast), z(ast48)), na.rm = TRUE),
    # match season model: use only oreb + dreb (not treb, avoids double-counting)
    Z_REB     = rowMeans(cbind(z(oreb48), z(dreb48)), na.rm = TRUE),
    Z_DISC    = rowMeans(cbind(-z(fouls48), -z(tov)), na.rm = TRUE),  # lower is better
    Z_DEF     = 0.6*z(stl48) + 0.4*z(blk48)
  ) %>%
  mutate(
    # --- Weighted total score (same weights as season) ---
    score_total = 0.15*Z_IMPACT +
      0.23*Z_SCORING +
      0.15*Z_PLAY +
      0.16*Z_REB +
      0.12*Z_DISC +
      0.19*Z_DEF,
    TOTAL_100 = scale_logistic(score_total, lower = 30, upper = 99)
  )

summary(logs_with_score$TOTAL_100)

# ---------------------------------------------------------
# 3. Hot/Cold streak detection function (with reasons)
# ---------------------------------------------------------
detect_streaks <- function(df,
                           ratio_hot5 = 1.15, ratio_cold5 = 0.85,
                           ratio_hot10 = 1.10, ratio_cold10 = 0.90,
                           z_hot = 0.5, z_cold = -0.5,
                           min_minutes5 = 75, min_minutes10 = 150) {
  if (nrow(df) < 5) return(NULL)
  
  df <- df %>% arrange(dateGame)
  
  # --- minutes filter (skip players who barely played) ---
  min5  <- sum(tail(df$minutes, 5), na.rm = TRUE)
  min10 <- sum(tail(df$minutes, 10), na.rm = TRUE)
  if (min5 < min_minutes5 & min10 < min_minutes10) return(NULL)
  
  # --- season baselines ---
  season_avg <- mean(df$TOTAL_100, na.rm = TRUE)
  season_sd  <- sd(df$TOTAL_100, na.rm = TRUE)
  if (is.na(season_sd) || season_sd == 0) season_sd <- 1e-6
  
  # --- season category averages ---
  season_cats <- df %>%
    summarise(
      SCORING = mean(Z_SCORING, na.rm = TRUE),
      PLAY    = mean(Z_PLAY, na.rm = TRUE),
      REB     = mean(Z_REB, na.rm = TRUE),
      DEF     = mean(Z_DEF, na.rm = TRUE),
      DISC    = mean(Z_DISC, na.rm = TRUE),
      IMPACT  = mean(Z_IMPACT, na.rm = TRUE)
    )
  
  # --- streak calculations ---
  df <- df %>%
    mutate(
      streak_total5  = zoo::rollapply(TOTAL_100, 5, mean, align = "right", fill = NA, na.rm = TRUE),
      streak_total10 = zoo::rollapply(TOTAL_100, 10, mean, align = "right", fill = NA, na.rm = TRUE),
      diff5 = streak_total5 - season_avg,
      diff10 = streak_total10 - season_avg,
      z5  = (streak_total5 - season_avg) / season_sd,
      z10 = (streak_total10 - season_avg) / season_sd,
      hot5   = (streak_total5 >= season_avg * ratio_hot5)  & (z5  >= z_hot),
      cold5  = (streak_total5 <= season_avg * ratio_cold5) & (z5  <= z_cold),
      hot10  = (streak_total10 >= season_avg * ratio_hot10)  & (z10 >= z_hot),
      cold10 = (streak_total10 <= season_avg * ratio_cold10) & (z10 <= z_cold)
    )
  
  # --- latest game output ---
  latest <- df %>%
    slice_tail(n = 1) %>%
    mutate(
      SCORING_5 = mean(tail(Z_SCORING, 5), na.rm = TRUE),
      PLAY_5    = mean(tail(Z_PLAY, 5), na.rm = TRUE),
      REB_5     = mean(tail(Z_REB, 5), na.rm = TRUE),
      DEF_5     = mean(tail(Z_DEF, 5), na.rm = TRUE),
      DISC_5    = mean(tail(Z_DISC, 5), na.rm = TRUE),
      IMPACT_5  = mean(tail(Z_IMPACT, 5), na.rm = TRUE),
      dSCORING  = coalesce(SCORING_5 - season_cats$SCORING, 0),
      dPLAY     = coalesce(PLAY_5 - season_cats$PLAY, 0),
      dREB      = coalesce(REB_5 - season_cats$REB, 0),
      dDEF      = coalesce(DEF_5 - season_cats$DEF, 0),
      dDISC     = coalesce(DISC_5 - season_cats$DISC, 0),
      dIMPACT   = coalesce(IMPACT_5 - season_cats$IMPACT, 0)
    ) %>%
    rowwise() %>%
    mutate(
      top_cats = {
        diffs <- c(SCORING = dSCORING, PLAY = dPLAY, REB = dREB,
                   DEF = dDEF, DISC = dDISC, IMPACT = dIMPACT)
        diffs <- diffs[!is.na(diffs)]
        if (all(diffs == 0)) {
          "balanced play"
        } else {
          paste(head(names(sort(diffs, decreasing = TRUE)), 2), collapse = ", ")
        }
      },
      reason = case_when(
        hot5  ~ paste0("Last 5 avg (", round(streak_total5,1),
                       ") is ", round(diff5,1), " above season avg (", round(season_avg,1),
                       "). Boosted by ", top_cats),
        cold5 ~ paste0("Last 5 avg (", round(streak_total5,1),
                       ") is ", abs(round(diff5,1)), " below season avg (", round(season_avg,1),
                       "). Dragged down by ", top_cats),
        hot10 ~ paste0("Last 10 avg (", round(streak_total10,1),
                       ") is ", round(diff10,1), " above season avg (", round(season_avg,1),
                       "). Boosted by ", top_cats),
        cold10~ paste0("Last 10 avg (", round(streak_total10,1),
                       ") is ", abs(round(diff10,1)), " below season avg (", round(season_avg,1),
                       "). Dragged down by ", top_cats),
        TRUE  ~ paste0("Recent form (", round(streak_total5,1),
                       ") is close to season avg (", round(season_avg,1), ")")
      )
    ) %>%
    ungroup() %>%
    select(idPlayer, namePlayer, slugTeam, dateGame, TOTAL_100,
           streak_total5, streak_total10, diff5, diff10,
           hot5, cold5, hot10, cold10, reason)
  
  return(latest)
}

# ---------------------------------------------------------
# 4. Apply to every player
# ---------------------------------------------------------
league_streaks <- logs_with_score %>%
  filter(!is.na(TOTAL_100)) %>%      # drop NA games (minutes=0, etc.)
  group_by(idPlayer) %>%
  group_split() %>%
  lapply(detect_streaks) %>%
  bind_rows()

# ---------------------------------------------------------
# 5. Add a status label for dashboard
# ---------------------------------------------------------
streak_summary <- league_streaks %>%
  mutate(
    status = case_when(
      hot5  ~ "On Fire (last 5)",
      cold5 ~ "Cold (last 5)",
      hot10 ~ "On Fire (last 10)",
      cold10~ "Cold (last 10)",
      TRUE  ~ "— Steady"
    )
  ) %>%
  arrange(desc(diff5), desc(diff10))   # order by biggest swing
View(streak_summary)

# ---------------------------------------------------------
# 6. Preview
# ---------------------------------------------------------
head(streak_summary, 10)

# Sort streak_total5 in descending order to find the top 5 players
top_5_players_5 <- streak_summary %>%
  arrange(desc(streak_total5)) %>%
  head(5)

# Alternatively, sort streak_total10 in descending order to find the top 5 players
top_5_players_10 <- streak_summary %>%
  arrange(desc(streak_total10)) %>%
  head(5)

bot_5_players_5 <- streak_summary %>%
  arrange((streak_total5)) %>%
  head(5)


bot_5_players_10 <- streak_summary %>%
  arrange((streak_total10)) %>%
  head(5)


# View the top 5 players based on streak_total5
print(top_5_players_5)

# View the top 5 players based on streak_total10
print(top_5_players_10)

print(bot_5_players_5)

print(bot_5_players_10)



write.csv(res,"res")


