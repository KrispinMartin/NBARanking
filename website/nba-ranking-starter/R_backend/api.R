library(plumber)
library(dplyr)

#* @apiTitle NBA Ranking API

# ------------------------------
# Enable CORS
# ------------------------------
#* @filter cors
cors <- function(req, res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  res$setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res$setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
  
  if (req$REQUEST_METHOD == "OPTIONS") {
    return(list())
  } else {
    forward()
  }
}

# ------------------------------
# Load CSVs
# ------------------------------
rankings <- read.csv("ranking_model.csv")
stats    <- read.csv("nba_player_comparison.csv")

# ------------------------------
# Rankings endpoint
# ------------------------------
#* @get /rankings
function(limit = 360) {
  rankings %>%
    left_join(
      stats %>% select(player_name, headshot_href),
      by = c("namePlayer" = "player_name")
    ) %>%
    transmute(
      rank,
      namePlayer,
      team = team_abbreviation,
      pos  = position_abbreviation,
      headshot_href,                       # ✅ comes from stats now
      score = round(TOTAL_100, 1)          # ✅ comes from ranking_model.csv
    ) %>%
    head(as.numeric(limit))
}

# ------------------------------
# Compare endpoint
# ------------------------------
#* @get /compare
function(player1 = "", player2 = "", player3 = "", player4 = "") {
  players <- c(player1, player2, player3, player4)
  players <- players[players != ""]
  
  stats %>%
    filter(player_name %in% players) %>%
    transmute(
      rank,
      namePlayer = player_name,            # ✅ rename to match frontend
      team,
      pos = position,
      headshot_href,
      score      = round(TOTAL_100, 1),
      impact     = round(IMPACT_100, 1),
      scoring    = round(SCORING_100, 1),
      playmaking = round(PLAY_100, 1),
      rebounding = round(REB_100, 1),
      discipline = round(DISC_100, 1),
      defense    = round(DEF_100, 1)
    )
}

# ------------------------------
# Load CSVs for hot/cold trends
# ------------------------------
trend5 <- read.csv("nba_trends_page_5.csv")
trend10 <- read.csv("nba_trends_page_10.csv")

# Trends endpoint
# ------------------------------
#* @get /trends
# Returns top 10 "hot" and bottom 10 "cold" players based on total streak scores
function(range = 5, limit = 10) {
  range <- as.numeric(range)
  data <- if (range == 10) trend10 else trend5
  
  # Clean up missing data just in case
  data[is.na(data)] <- 0
  
  # Sort descending for hot players and ascending for cold players
  hot <- data %>%
    arrange(desc(if (range == 10) streak_total10 else streak_total5)) %>%
    head(as.numeric(limit)) %>%
    transmute(
      player_name,
      team,
      position,
      headshot_href,
      streak_value = round(if (range == 10) streak_total10 else streak_total5, 1)
    )
  
  cold <- data %>%
    arrange(if (range == 10) streak_total10 else streak_total5) %>%
    head(as.numeric(limit)) %>%
    transmute(
      player_name,
      team,
      position,
      headshot_href,
      streak_value = round(if (range == 10) streak_total10 else streak_total5, 1)
    )
  
  # Return as a combined list
  return(list(hot = hot, cold = cold))
}

