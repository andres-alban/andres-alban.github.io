let div = document.getElementById('plot');

let layout = {
  margin: { t: 30 },
  xaxis: {title:{text: "Sample size (T)"}},
  yaxis: {type: "log"},
  legend: {y:0,yanchor: "bottom"}
};
let config = {editable: false,
  // staticPlot: true,
  // displayModeBar: "auto",
  displaylogo:false,
  modeBarButtonsToRemove:["zoom2d","select2d","lasso2d"],
  toImageButtonOptions: {
    format: 'png', // one of png, svg, jpeg, webp
    scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
  }
};

const exclude_fields = ["T","delay","reps","SampleSize"];
function plot_fixed_label(filename,pics=false,on=false) {
  fetch("../Experiments/Exp4/" + filename + ".json")
  .then((res)=> res.json())
  .then((res)=>{
    // console.log(res)

    let data = [];
    let T = res["T"];
    let metric = pics ? "PICS" : "EOC";
    if (on) metric = "cumul" + metric + "_on";
    else metric += "_off";
    metric += "_mean";
    let x = Array(T + !on).fill().map((element, index) => index + on);
    for (let key in res) {
      if (exclude_fields.includes(key)) continue;
      data.push({
        x: x,
        y: res[key][metric],
        name: key
      });
    }
    data.sort((a,b)=> b.y[b.y.length-1] - a.y[a.y.length-1]);

    layout["title"] = {text: filename};
    layout["yaxis"]["title"] = {text: metric};
    if (on) layout["yaxis"]["type"] = "linear";
    else layout["yaxis"]["type"] = "log";
    config["toImageButtonOptions"]["filename"] = filename;
    Plotly.newPlot(
      div, 
      data, 
      layout,
      config
    );
  });
}

function plot_dynamic(filename,pics=false,on=false) {
  let results = [
    fetch("../Experiments/Exp4/" + filename + "_dynamic.json").then((res)=> res.json()),
    fetch("../Experiments/Exp4/" + filename + "_1.json").then((res)=> res.json()),
    fetch("../Experiments/Exp4/" + filename + "_9.json").then((res)=> res.json()),
    fetch("../Experiments/Exp4/" + filename + "_15.json").then((res)=> res.json())
  ];
  let names = ["dynamic min","dynamic sparser","dynamic less sparse", "known labeling", "all prog", "all active"]
  let keys = ["dynamic_fEVI_LassoCV_min","dynamic_fEVI_LassoCV_1se","dynamic_fEVI_LassoCV_1se_rev","fEVI","fEVI","fEVI"] 

  Promise.all(results).then((ress)=>{
    // console.log(res)
    let res = ress[1];
    let data = [];
    let T = res["T"];
    let metric = pics ? "PICS" : "EOC";
    if (on) metric = "cumul" + metric +"_on";
    else metric += "_off";
    metric += "_mean";
    let x = Array(T + !on).fill().map((element, index) => index + on);
    for (let i=0; i<names.length; ++i) {
      let file;
      if (i < 3) file = 0;
      else file = i-2;
      data.push({
        x: x,
        y: ress[file][keys[i]][metric],
        name: names[i]
      });
    }
    data.sort((a,b)=> b.y[b.y.length-1] - a.y[a.y.length-1]);

    layout["title"] = {text: "fEVI: dynamic vs. different labelings"};
    layout["yaxis"]["title"] = {text: metric};
    if (on) layout["yaxis"]["type"] = "linear";
    else layout["yaxis"]["type"] = "log";
    config["toImageButtonOptions"]["filename"] = filename + "_dynamic";
    Plotly.newPlot(
      div, 
      data, 
      layout,
      config
    );
  });
}

let exp = document.getElementById("exp");
let pics = document.getElementById("pics");
let on = document.getElementById("on");
function newplot() {
  if (exp.value.endsWith("_dynamic")) {
    plot_dynamic(exp.value.slice(0,exp.value.length-8), pics.checked, on.checked);
  }
  else {
    plot_fixed_label(exp.value, pics.checked, on.checked);
  }
}
exp.onchange = newplot;
pics.onchange = newplot;
on.onchange = newplot;
newplot();
