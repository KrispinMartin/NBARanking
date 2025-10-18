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
# Rankings endpoint (DYNAMIC STAT FILTER)
# ------------------------------
#* @get /rankings
#* @param limit:number The number of players to return
#* @param stat The metric to rank players by (TOTAL_100, IMPACT_100, SCORING_100, PLAY_100, REB_100, DISC_100, DEF_100)
function(limit = 360, stat = "TOTAL_100") {
  
  # Valid stats
  valid_stats <- c("TOTAL_100", "IMPACT_100", "SCORING_100", "PLAY_100", "REB_100", "DISC_100", "DEF_100")
  if (!(stat %in% valid_stats)) stat <- "TOTAL_100"
  
  # Clean join – take team/pos from rankings, stats from nba_player_comparison
  merged <- stats %>%
    left_join(
      rankings %>%
        select(namePlayer, team_abbreviation, position_abbreviation),
      by = c("player_name" = "namePlayer")
    ) %>%
    mutate(
      team = coalesce(team, team_abbreviation),
      pos = coalesce(position, position_abbreviation)
    )
  
  # Compute TOTAL_100 if missing (safety)
  if (!"TOTAL_100" %in% names(merged)) {
    cols <- intersect(c("IMPACT_100", "SCORING_100", "PLAY_100", "REB_100", "DISC_100", "DEF_100"), names(merged))
    merged <- merged %>%
      mutate(TOTAL_100 = rowMeans(select(., all_of(cols)), na.rm = TRUE))
  }
  
  # Create clean output
  merged %>%
    mutate(score = round(.data[[stat]], 1)) %>%
    arrange(desc(score)) %>%
    transmute(
      rank = row_number(),
      namePlayer = player_name,
      team,
      pos,
      headshot_href,
      score
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
      namePlayer = player_name,
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
# Trends endpoint
# ------------------------------
trend5  <- read.csv("nba_trends_page_5.csv")
trend10 <- read.csv("nba_trends_page_10.csv")

#* @get /trends
function(range = 5, limit = 10) {
  range <- as.numeric(range)
  data <- if (range == 10) trend10 else trend5
  data[is.na(data)] <- 0
  
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
  
  return(list(hot = hot, cold = cold))
}

