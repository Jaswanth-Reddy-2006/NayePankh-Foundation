import { IUser, IEvent } from "@/types";

export interface MatchResult {
  score: number;
  reasons: string[];
}

export function calculateEventMatch(
  user: IUser,
  event: IEvent,
  pastEventCategories: string[] = []
): MatchResult {
  let score = 0;
  const reasons: string[] = [];

  const userSkills = (user.skills || []).map((s) => s.toLowerCase().trim());
  const userInterests = (user.interests || []).map((i) => i.toLowerCase().trim());
  const eventSkills = (event.skillsRequired || []).map((s) => s.toLowerCase().trim());
  const eventCategory = (event.category || "").toLowerCase().trim();

  // 1. Skills Match (40% Weight)
  if (eventSkills.length > 0) {
    const matchingSkills = eventSkills.filter((skill) =>
      userSkills.some((uSkill) => uSkill.includes(skill) || skill.includes(uSkill))
    );

    if (matchingSkills.length > 0) {
      const skillsScore = Math.round((matchingSkills.length / eventSkills.length) * 40);
      score += skillsScore;
      reasons.push(
        `Matches your skills: ${matchingSkills
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(", ")} (+${skillsScore}%)`
      );
    } else {
      reasons.push("Try learning new skills required for this event");
    }
  } else {
    // No specific skills required -> open to everyone!
    score += 40;
    reasons.push("Open to all skill levels! (+40%)");
  }

  // 2. Interests / Category Match (40% Weight)
  const isCategoryInterested = userInterests.some(
    (interest) => interest.includes(eventCategory) || eventCategory.includes(interest)
  );

  if (isCategoryInterested) {
    score += 30;
    reasons.push(`Aligns with your interest in "${event.category}" (+30%)`);
  }

  // Check additional text matching in title/description for interests
  const eventText = `${event.title} ${event.description}`.toLowerCase();
  const matchingKeywords = userInterests.filter(
    (interest) => interest.length > 2 && eventText.includes(interest)
  );

  if (matchingKeywords.length > 0) {
    const bonus = Math.min(matchingKeywords.length * 5, 10);
    score += bonus;
    reasons.push(
      `Event details match your interests: ${matchingKeywords.slice(0, 2).join(", ")} (+${bonus}%)`
    );
  }

  // 3. Past Experience Match (20% Weight)
  if (pastEventCategories.length > 0) {
    const participatedBeforeInThisCategory = pastEventCategories.some(
      (cat) => cat.toLowerCase().trim() === eventCategory
    );

    if (participatedBeforeInThisCategory) {
      score += 20;
      reasons.push(`You have previously successfully volunteered in "${event.category}" (+20%)`);
    } else {
      score += 10;
      reasons.push("Broaden your impact by trying a new event category (+10%)");
    }
  } else {
    // New volunteer
    score += 15;
    reasons.push("Great starting event for new volunteers! (+15%)");
  }

  // Ensure score is bounded between 0 and 99. We cap at 99 so there is always room to grow, or let it reach 100 for perfect match.
  const finalScore = Math.min(Math.max(score, 45), 100); // Minimum base score of 45% to keep volunteers encouraged

  return {
    score: finalScore,
    reasons: reasons.length > 0 ? reasons : ["Good fit for your volunteer profile"],
  };
}
