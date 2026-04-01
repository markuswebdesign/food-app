"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Flame, Info, Loader2, CheckCircle2 } from "lucide-react";
import {
  calcTdee,
  calcCalorieGoal,
  validateHealthInputs,
  ACTIVITY_FACTORS,
  type ActivityLevel,
  type GoalType,
} from "@/lib/utils/tdee";

export type HealthProfile = {
  weight_kg: number | null;
  height_cm: number | null;
  age: number | null;
  activity_level: ActivityLevel | null;
  goal_type: GoalType | null;
  custom_calorie_goal: number | null;
};

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sitzend (kaum Bewegung)",
  lightly_active: "Leicht aktiv (1–2× Sport/Woche)",
  moderately_active: "Mäßig aktiv (3–5× Sport/Woche)",
  very_active: "Sehr aktiv (6–7× Sport/Woche)",
  extra_active: "Extrem aktiv (körperliche Arbeit + Sport)",
};


interface Props {
  userId: string;
  initial: HealthProfile;
}

export function ProfileHealthForm({ userId, initial }: Props) {
  const supabase = createClient();

  const [weight, setWeight] = useState(initial.weight_kg?.toString() ?? "");
  const [height, setHeight] = useState(initial.height_cm?.toString() ?? "");
  const [age, setAge] = useState(initial.age?.toString() ?? "");
  const [activity, setActivity] = useState<ActivityLevel | "">(
    initial.activity_level ?? ""
  );
  const [goal, setGoal] = useState<GoalType>(initial.goal_type ?? "lose");
  const [customGoal, setCustomGoal] = useState(
    initial.custom_calorie_goal?.toString() ?? ""
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Live TDEE calculation
  const w = parseFloat(weight);
  const h = parseFloat(height);
  const a = parseInt(age);
  const canCalc =
    !isNaN(w) && !isNaN(h) && !isNaN(a) && activity !== "" &&
    w >= 30 && w <= 300 && h >= 100 && h <= 250 && a >= 10 && a <= 120;

  const tdee = canCalc ? calcTdee(w, h, a, activity as ActivityLevel) : null;
  const effectiveGoal =
    tdee !== null
      ? calcCalorieGoal(tdee, goal, customGoal ? parseInt(customGoal) : null)
      : null;

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (weight || height || age) {
      const fieldErrors = validateHealthInputs(
        weight ? parseFloat(weight) : 60,
        height ? parseFloat(height) : 170,
        age ? parseInt(age) : 30
      );
      if (weight && fieldErrors.weight) newErrors.weight = fieldErrors.weight;
      if (height && fieldErrors.height) newErrors.height = fieldErrors.height;
      if (age && fieldErrors.age) newErrors.age = fieldErrors.age;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    const prev: HealthProfile = {
      weight_kg: initial.weight_kg,
      height_cm: initial.height_cm,
      age: initial.age,
      activity_level: initial.activity_level,
      goal_type: initial.goal_type,
      custom_calorie_goal: initial.custom_calorie_goal,
    };

    // Optimistic update
    setStatus("saving");

    const updates = {
      weight_kg: weight ? parseFloat(weight) : null,
      height_cm: height ? parseFloat(height) : null,
      age: age ? parseInt(age) : null,
      activity_level: activity || null,
      goal_type: goal,
      custom_calorie_goal: customGoal ? parseInt(customGoal) : null,
    };

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId);

    if (error) {
      // Rollback
      setWeight(prev.weight_kg?.toString() ?? "");
      setHeight(prev.height_cm?.toString() ?? "");
      setAge(prev.age?.toString() ?? "");
      setActivity(prev.activity_level ?? "");
      setGoal(prev.goal_type ?? "lose");
      setCustomGoal(prev.custom_calorie_goal?.toString() ?? "");
      setStatus("error");
      setErrorMsg("Speichern fehlgeschlagen. Bitte versuche es erneut.");
      return;
    }

    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Personal Data */}
      <Card>
        <CardHeader>
          <CardTitle>Körperdaten</CardTitle>
          <CardDescription>
            Wird zur Berechnung deines täglichen Kalorienbedarfs (TDEE) verwendet.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="weight">Gewicht (kg)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="z.B. 75"
              value={weight}
              onChange={(e) => {
                setWeight(e.target.value);
                setErrors((prev) => ({ ...prev, weight: "" }));
              }}
            />
            {errors.weight && (
              <p className="text-xs text-destructive">{errors.weight}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="height">Größe (cm)</Label>
            <Input
              id="height"
              type="number"
              placeholder="z.B. 175"
              value={height}
              onChange={(e) => {
                setHeight(e.target.value);
                setErrors((prev) => ({ ...prev, height: "" }));
              }}
            />
            {errors.height && (
              <p className="text-xs text-destructive">{errors.height}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="age">Alter (Jahre)</Label>
            <Input
              id="age"
              type="number"
              placeholder="z.B. 30"
              value={age}
              onChange={(e) => {
                setAge(e.target.value);
                setErrors((prev) => ({ ...prev, age: "" }));
              }}
            />
            {errors.age && (
              <p className="text-xs text-destructive">{errors.age}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Goal & Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Ziel & Aktivität</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Mein Ziel</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={goal === "lose" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setGoal("lose")}
              >
                Abnehmen
              </Button>
              <Button
                type="button"
                variant={goal === "maintain" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setGoal("maintain")}
              >
                Gewicht halten
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="activity">Aktivitätslevel</Label>
            <Select
              value={activity}
              onValueChange={(val) => setActivity(val as ActivityLevel)}
            >
              <SelectTrigger id="activity">
                <SelectValue placeholder="Wähle dein Aktivitätslevel..." />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {ACTIVITY_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* TDEE Preview */}
      <Card className={canCalc ? "border-primary/30 bg-primary/5" : "bg-muted/40"}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Flame className="h-5 w-5 text-orange-500" />
            Dein Kalorienbedarf
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canCalc ? (
            <p className="text-sm text-muted-foreground">
              Fülle Gewicht, Größe, Alter und Aktivitätslevel aus, um deinen Bedarf zu sehen.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{tdee?.toLocaleString("de-DE")}</p>
                  <p className="text-xs text-muted-foreground mt-1">kcal Grundbedarf (TDEE)</p>
                </div>
                <div className="bg-background rounded-lg p-3 text-center border-2 border-primary">
                  <p className="text-2xl font-bold text-primary">
                    {effectiveGoal?.toLocaleString("de-DE") ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {customGoal ? "Manuelles Ziel" : goal === "lose" ? "Kalorienziel (−500)" : "Kalorienziel"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground bg-muted/60 rounded-lg p-3">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <p>
                  Berechnet mit der <strong>Mifflin-St Jeor Formel</strong> (geschlechterneutral).
                  {goal === "lose" && " Das Defizit von 500 kcal/Tag entspricht ca. 0,5 kg Gewichtsverlust pro Woche."}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Manual Override */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Manuelles Kalorienziel (optional)</CardTitle>
          <CardDescription>
            Überschreibe die automatische Berechnung mit einem eigenen Zielwert.
            Leer lassen, um die automatische Berechnung zu verwenden.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-start">
            <div className="flex-1 max-w-[200px]">
              <Input
                id="custom-goal"
                type="number"
                placeholder="z.B. 1800"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
              />
            </div>
            <span className="mt-2 text-sm text-muted-foreground">kcal / Tag</span>
            {customGoal && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => setCustomGoal("")}
              >
                Zurücksetzen
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      {status === "error" && (
        <p className="text-sm text-destructive">{errorMsg}</p>
      )}

      <Button
        onClick={handleSave}
        disabled={status === "saving"}
        size="lg"
        className="w-full sm:w-auto"
      >
        {status === "saving" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {status === "saved" && <CheckCircle2 className="h-4 w-4 mr-2" />}
        {status === "saving"
          ? "Speichern..."
          : status === "saved"
          ? "Gespeichert!"
          : "Profil speichern"}
      </Button>
    </div>
  );
}
