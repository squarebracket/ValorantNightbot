((
  /** @type {string} */ streamUptimeString,
  /** @type {string} */ streamStartDateString,
  /** @type {string} */ urlEncodedGetMmrHistoryResponseJson,
  /** @type {string} */ urlEncodedGetMatchHistoryResponseJson,
  /** @type {string} */ playerName,
) => {

  /* streamStartDateString will be a date string even if the channel is not currently live (the date will be the current
     date). This may be a Nightbot bug. This is why streamUptimeString is needed to check whether the channel is live */
  if (/\bnot live\b/i.test(streamUptimeString)) {
    return `${playerName} is not live.`;
  }

  const streamStartDate = new Date(streamStartDateString);
  if (Number.isNaN(streamStartDate.valueOf())) {
    return `Failed to parse stream start date: ${streamStartDateString}`.slice(0, 400);
  }

  const getMmrHistoryResponseJson = decodeURIComponent(urlEncodedGetMmrHistoryResponseJson);
  if (/^Error Connecting To Remote Server\b/i.test(getMmrHistoryResponseJson)) {
    return getMmrHistoryResponseJson;
  }

  const getMatchHistoryResponseJson = decodeURIComponent(urlEncodedGetMatchHistoryResponseJson);
  if (/^Error Connecting To Remote Server\b/i.test(getMatchHistoryResponseJson)) {
    return getMatchHistoryResponseJson;
  }

  try {
    /** @type {{
      readonly data: ReadonlyArray<{
        readonly mmr_change_to_last_game: number;
        readonly date_raw: number;
      }>;
    }} */
    const getMmrHistoryResponse = JSON.parse(getMmrHistoryResponseJson).data;
    const getMatchHistoryResponse = JSON.parse(getMatchHistoryResponseJson).data.filter((match) => match.meta.mode === 'Competitive');

    let winCountThisStream = 0;
    let lossCountThisStream = 0;
    let drawCountThisStream = 0;
    
    let latestMatchThisStream = 0;
    let latestRawEloThisStream = null;
    let earliestMatchThisStream = Number.POSITIVE_INFINITY;
    let earliestRawEloThisStream = null;

    for (let i = 0; i < getMmrHistoryResponse.length; i++) {
      const {date_raw: dateUnixS, mmr_change_to_last_game: mmrChange, elo: rawElo} = getMmrHistoryResponse[i];
      const { teams } = getMatchHistoryResponse[i];
      const playerTeam = getMatchHistoryResponse[i].stats.team.toLowerCase();
      const otherTeam = playerTeam === 'red' ? 'blue' : 'red';
      const date = new Date(dateUnixS * 1000);

      if (date >= streamStartDate) {
        if (teams.red === teams.blue) {
          drawCountThisStream++;
        } else if (teams[playerTeam] > teams[otherTeam]) {
          winCountThisStream++;
        } else {
          lossCountThisStream++;
        }

        if (latestMatchThisStream < date) {
          latestMatchThisStream = date;
          latestRawEloThisStream = rawElo;
        }
        if (earliestMatchThisStream > date) {
          earliestMatchThisStream = date;
          earliestRawEloThisStream = rawElo - mmrChange;
        }
      }
    }
    let fullStreamEloChange = latestRawEloThisStream - earliestRawEloThisStream;

    return `${playerName} is ${fullStreamEloChange >= 0 ? 'UP' : 'DOWN'} ${fullStreamEloChange}RR this stream. Currently ${winCountThisStream}W - ${lossCountThisStream}L - ${drawCountThisStream}D.`;
  } catch (e) {
    return `Failed to parse MMR history: ${e.message}: ${getMmrHistoryResponseJson}`.slice(0, 400);
  }
})
